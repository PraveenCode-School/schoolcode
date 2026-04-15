const { pool } = require('../config/db');

// Simple test endpoint
exports.testAutoMark = async (req, res) => {
    try {
        const school_id = req.user.schoolId;
        const { month, year } = req.body;

        console.log('=== TEST AUTO-MARK ===');
        console.log('School ID:', school_id);
        console.log('Month:', month);
        console.log('Year:', year);

        // Test 1: Check teachers
        const teachers = await pool.query('SELECT id, name FROM teachers WHERE school_id = $1 LIMIT 3', [school_id]);
        console.log('Teachers found:', teachers.rows.length);
        console.log('Sample teachers:', teachers.rows);

        // Test 2: Check staff
        const staff = await pool.query('SELECT id, name FROM staff WHERE school_id = $1 LIMIT 3', [school_id]);
        console.log('Staff found:', staff.rows.length);
        console.log('Sample staff:', staff.rows);

        // Test 3: Try inserting one record
        const testDate = `${year}-${String(month).padStart(2, '0')}-01`;
        console.log('Test date:', testDate);

        if (teachers.rows.length > 0) {
            const testTeacher = teachers.rows[0];
            console.log('Trying to insert for teacher:', testTeacher.id);

            await pool.query(
                `INSERT INTO teacher_attendance (school_id, teacher_id, date, status)
                 VALUES ($1, $2, $3, 'Holiday')
                 ON CONFLICT (teacher_id, date) DO UPDATE SET status = 'Holiday'`,
                [school_id, testTeacher.id, testDate]
            );
            console.log('✅ Successfully inserted test record!');
        }

        res.json({
            success: true,
            teachersCount: teachers.rows.length,
            staffCount: staff.rows.length,
            message: 'Test completed - check backend console for details'
        });

    } catch (error) {
        console.error('❌ TEST FAILED:', error.message);
        console.error('Error details:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            code: error.code
        });
    }
};
