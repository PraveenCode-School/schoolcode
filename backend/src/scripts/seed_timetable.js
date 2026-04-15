const { pool } = require('../config/db');

async function seedTimetable() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('📅 Seeding Timetable Data for Rudra...');

        // 1. Get Student & Class
        const email = 'rudru888@gmail.com';
        const studentRes = await client.query(`SELECT id, school_id, class_id, section_id FROM students WHERE email = $1`, [email]);
        if (studentRes.rows.length === 0) {
            console.log('❌ Student not found!');
            return;
        }
        const student = studentRes.rows[0];
        const { school_id, class_id, section_id } = student;

        console.log(`Found Student ID: ${student.id}, Class: ${class_id}, Section: ${section_id}`);

        // 2. Get Subjects
        const subjectRes = await client.query(`SELECT id, name FROM subjects WHERE class_id = $1`, [class_id]);
        if (subjectRes.rows.length === 0) {
            console.log('❌ No subjects found for this class! Creating default ones...');
            const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science'];
            for (const sub of subjects) {
                await client.query(`INSERT INTO subjects (school_id, class_id, name, type) VALUES ($1, $2, $3, 'Theory')`, [school_id, class_id, sub]);
            }
        }

        // Refresh Subjects
        const subjects = (await client.query(`SELECT id, name FROM subjects WHERE class_id = $1`, [class_id])).rows;

        // 3. Get or Create Teacher
        let teacherRes = await client.query(`SELECT id FROM teachers WHERE school_id = $1 LIMIT 1`, [school_id]);
        let teacher_id;
        if (teacherRes.rows.length === 0) {
            const newTeacher = await client.query(`
                INSERT INTO teachers (school_id, name, email, password, subject_specialization)
                VALUES ($1, 'Teacher Ravi', 'ravi@school.com', 'password', 'Math')
                RETURNING id
             `, [school_id]);
            teacher_id = newTeacher.rows[0].id;
        } else {
            teacher_id = teacherRes.rows[0].id;
        }

        // 4. Seed Timetable (Monday to Saturday)
        // Clear existing
        await client.query(`DELETE FROM timetables WHERE class_id = $1 AND section_id = $2`, [class_id, section_id]);

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayMap = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };

        const slots = [
            { period: 1, start: '09:00:00', end: '10:00:00' },
            { period: 2, start: '10:00:00', end: '11:00:00' },
            { period: 3, start: '11:15:00', end: '12:15:00' },
            { period: 4, start: '12:15:00', end: '13:15:00' },
            { period: 5, start: '14:00:00', end: '15:00:00' }
        ];

        for (const day of days) {
            for (const slot of slots) {
                // Pick random subject
                const subject = subjects[Math.floor(Math.random() * subjects.length)];

                await client.query(`
                    INSERT INTO timetables (school_id, class_id, section_id, subject_id, teacher_id, day_of_week, start_time, end_time, period_number)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [school_id, class_id, section_id, subject.id, teacher_id, dayMap[day], slot.start, slot.end, slot.period]);
            }
        }

        await client.query('COMMIT');
        console.log('✅ Timetable seeded successfully!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding timetable:', err);
    } finally {
        client.release();
    }
}

seedTimetable();
