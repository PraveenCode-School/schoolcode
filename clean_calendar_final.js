const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { pool } = require('./backend/src/config/db');

async function cleanAndFixCalendar() {
    console.log('--- Cleaning Calendar 2026 (School ID: 1) ---');
    if (!pool) {
        console.error('Failed to load pool');
        process.exit(1);
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. DELETE all events of type 'Holiday' for 2026
        // We delete by both string date and potential timestamp matches
        await client.query(`
            DELETE FROM events 
            WHERE school_id = 1 
            AND event_type = 'Holiday' 
            AND (
                (start_date::text LIKE '2026-%')
                OR 
                (start_date >= '2026-01-01' AND start_date <= '2026-12-31')
            )
        `);
        console.log('✅ Deleted all old holidays for 2026');

        // 2. Define TRUE Holidays (Festivals) - Corrected dates
        const festivals = [
            { date: '2026-01-14', title: 'Makara Sankranti' },
            { date: '2026-01-26', title: 'Republic Day' },
            { date: '2026-02-15', title: 'Maha Shivaratri' },
            { date: '2026-03-19', title: 'Ugadi' },
            { date: '2026-03-20', title: 'Ramzan' },
            { date: '2026-04-03', title: 'Good Friday' },
            { date: '2026-04-14', title: 'Dr. Ambedkar Jayanti' },
            { date: '2026-05-01', title: 'May Day' },
            { date: '2026-08-15', title: 'Independence Day' },
            { date: '2026-09-14', title: 'Ganesh Chaturthi' },
            { date: '2026-10-02', title: 'Gandhi Jayanti' },
            { date: '2026-10-21', title: 'Vijayadashami' },
            { date: '2026-11-01', title: 'Kannada Rajyotsava' },
            { date: '2026-11-08', title: 'Deepavali' },
            { date: '2026-12-25', title: 'Christmas' }
        ];

        for (const f of festivals) {
            await client.query(`
                INSERT INTO events (school_id, title, event_type, start_date, end_date, description, audience)
                VALUES (1, $1, 'Holiday', $2, $2, 'Public Holiday', 'All')
            `, [f.title, `${f.date} 12:00:00`]);
        }
        console.log(`✅ Added ${festivals.length} festival holidays`);

        // 3. Add ONLY Sundays
        let sundayCount = 0;
        for (let m = 0; m < 12; m++) {
            let days = new Date(2026, m + 1, 0).getDate();
            for (let d = 1; d <= days; d++) {
                let date = new Date(2026, m, d);
                if (date.getDay() === 0) { // Sunday
                    let dateStr = `2026-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')} 12:00:00`;
                    await client.query(`
                        INSERT INTO events (school_id, title, event_type, start_date, end_date, description, audience)
                        VALUES (1, 'Sunday', 'Holiday', $1, $1, 'Weekly Holiday', 'All')
                    `, [dateStr]);
                    sundayCount++;
                }
            }
        }
        console.log(`✅ Added ${sundayCount} Sundays`);

        await client.query('COMMIT');
        console.log('\nSUCCESS! Calendar is now clean.');
        console.log('Now please go to the app, Sync from Calendar, and then Auto-Mark.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
    } finally {
        client.release();
        process.exit(0);
    }
}

cleanAndFixCalendar();
