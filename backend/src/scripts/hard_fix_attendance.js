const { pool } = require('../config/db');

const formatDateLocal = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

async function fixEverything() {
    const school_id = 1;
    console.log(`--- ULTRA FAST HARD RESET for School ID ${school_id} ---`);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Sync from Calendar to School Holidays
        console.log('1. Syncing holidays from Calendar...');
        await client.query(`DELETE FROM school_holidays WHERE school_id = $1 AND holiday_date >= '2026-01-01' AND holiday_date <= '2026-12-31'`, [school_id]);

        const events = await client.query(`
            SELECT title, TO_CHAR(start_date, 'YYYY-MM-DD') as hdate 
            FROM events 
            WHERE school_id = $1 AND event_type = 'Holiday' AND (start_date::text LIKE '2026-%' OR (start_date >= '2026-01-01' AND start_date <= '2026-12-31'))
        `, [school_id]);

        if (events.rows.length > 0) {
            const holidayValues = [];
            const placeholders = [];
            events.rows.forEach((e, i) => {
                const dateStr = e.hdate;
                placeholders.push(`($1, $${i * 2 + 2}, $${i * 2 + 3}, true)`);
                holidayValues.push(dateStr, e.title);
            });
            await client.query(`INSERT INTO school_holidays (school_id, holiday_date, holiday_name, is_paid) VALUES ${placeholders.join(', ')} ON CONFLICT DO NOTHING`, [school_id, ...holidayValues]);
        }
        console.log(`✅ Synced ${events.rows.length} holidays.`);

        // 2. Clear WRONG "Holiday" markers (especially Saturdays/Fridays)
        console.log('2. Cleaning attendance tables...');
        // Instead of setting to 'Present', which might be wrong if they were unmarked, 
        // we DELETE the 'Holiday' records if they don't match the new correct list.
        // For simplicity, we delete ALL 'Holiday' markers for 2026 first.
        const tables = ['teacher_attendance', 'staff_attendance', 'attendance'];
        for (const table of tables) {
            const res = await client.query(`DELETE FROM ${table} WHERE school_id = $1 AND date >= '2026-01-01' AND date <= '2026-12-31' AND status = 'Holiday'`, [school_id]);
            console.log(`✅ Deleted ${res.rowCount} old markers from ${table}`);
        }

        // 3. APPLY Correct markers using BULK logic
        console.log('3. Applying correct markers (BULK)...');
        const holidays = await client.query(`SELECT TO_CHAR(holiday_date, 'YYYY-MM-DD') as hdate FROM school_holidays WHERE school_id = $1 AND holiday_date >= '2026-01-01' AND holiday_date <= '2026-12-31'`, [school_id]);
        const teacherIds = (await client.query('SELECT id FROM teachers WHERE school_id = $1', [school_id])).rows.map(r => r.id);
        const staffIds = (await client.query('SELECT id FROM staff WHERE school_id = $1', [school_id])).rows.map(r => r.id);
        const studentIds = (await client.query('SELECT id FROM students WHERE school_id = $1', [school_id])).rows.map(r => r.id);

        for (const h of holidays.rows) {
            const dateStr = h.hdate;

            if (teacherIds.length > 0) {
                await client.query(`INSERT INTO teacher_attendance (school_id, teacher_id, date, status) SELECT $1, unnest($2::int[]), $3, 'Holiday' ON CONFLICT (teacher_id, date) DO UPDATE SET status = 'Holiday'`, [school_id, teacherIds, dateStr]);
            }
            if (staffIds.length > 0) {
                await client.query(`INSERT INTO staff_attendance (school_id, staff_id, date, status) SELECT $1, unnest($2::int[]), $3, 'Holiday' ON CONFLICT (staff_id, date) DO UPDATE SET status = 'Holiday'`, [school_id, staffIds, dateStr]);
            }
            if (studentIds.length > 0) {
                await client.query(`INSERT INTO attendance (school_id, student_id, date, status) SELECT $1, unnest($2::int[]), $3, 'Holiday' ON CONFLICT (student_id, date) DO UPDATE SET status = 'Holiday'`, [school_id, studentIds, dateStr]);
            }
            console.log(`..Marked ${dateStr}`);
        }

        await client.query('COMMIT');
        console.log('\nSUCCESS! Data is completely fixed.');

    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
    } finally {
        client.release();
        process.exit(0);
    }
}

fixEverything();
