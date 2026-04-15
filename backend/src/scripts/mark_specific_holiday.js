const { pool } = require('../config/db');

async function markHolidayAttendance() {
    const client = await pool.connect();
    try {
        // Get the holiday date you want to mark
        const holidayDate = '2026-01-07'; // January 7, 2026
        const school_id = 1;

        console.log(`Marking attendance as Holiday for ${holidayDate}...\n`);

        await client.query('BEGIN');

        // Get all teachers
        const teachers = await client.query('SELECT id FROM teachers WHERE school_id = $1', [school_id]);
        console.log(`Found ${teachers.rows.length} teachers`);

        // Get all staff
        const staff = await client.query('SELECT id FROM staff WHERE school_id = $1', [school_id]);
        console.log(`Found ${staff.rows.length} staff`);

        // Get all students
        const students = await client.query('SELECT id FROM students WHERE school_id = $1 AND (status IS NULL OR status != \'Deleted\')', [school_id]);
        console.log(`Found ${students.rows.length} students\n`);

        // Mark teachers
        if (teachers.rows.length > 0) {
            const teacherIds = teachers.rows.map(r => r.id);
            const result = await client.query(`
                INSERT INTO teacher_attendance (school_id, teacher_id, date, status)
                SELECT $1, t_id, $2::date, 'Holiday'
                FROM unnest($3::int[]) as t_id
                ON CONFLICT (teacher_id, date) DO UPDATE SET status = 'Holiday'
            `, [school_id, holidayDate, teacherIds]);
            console.log(`✅ Marked ${teachers.rows.length} teachers as Holiday`);
        }

        // Mark staff
        if (staff.rows.length > 0) {
            const staffIds = staff.rows.map(r => r.id);
            const result = await client.query(`
                INSERT INTO staff_attendance (school_id, staff_id, date, status)
                SELECT $1, s_id, $2::date, 'Holiday'
                FROM unnest($3::int[]) as s_id
                ON CONFLICT (staff_id, date) DO UPDATE SET status = 'Holiday'
            `, [school_id, holidayDate, staffIds]);
            console.log(`✅ Marked ${staff.rows.length} staff as Holiday`);
        }

        // Mark students
        if (students.rows.length > 0) {
            const studentIds = students.rows.map(r => r.id);
            const result = await client.query(`
                INSERT INTO attendance (school_id, student_id, date, status)
                SELECT $1, st_id, $2::date, 'Holiday'
                FROM unnest($3::int[]) as st_id
                ON CONFLICT (student_id, date) DO UPDATE SET status = 'Holiday'
            `, [school_id, holidayDate, studentIds]);
            console.log(`✅ Marked ${students.rows.length} students as Holiday`);
        }

        await client.query('COMMIT');
        console.log(`\n🎉 Successfully marked ${holidayDate} as Holiday for everyone!`);

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', e.message);
    } finally {
        client.release();
        process.exit(0);
    }
}

markHolidayAttendance();
