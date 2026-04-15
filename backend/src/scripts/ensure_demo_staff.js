const { pool } = require('../config/db');

async function checkStaffEmail() {
    try {
        const client = await pool.connect();
        const res = await client.query("SELECT * FROM staff WHERE email = 'staff@demo.com'");
        if (res.rows.length > 0) {
            console.log('Staff profile exists.');
        } else {
            console.log('Staff profile DOES NOT exist.');
            // Insert it
            const schoolRes = await client.query('SELECT id FROM schools LIMIT 1');
            if (schoolRes.rows.length > 0) {
                const schoolId = schoolRes.rows[0].id;
                await client.query(`
                    INSERT INTO staff (school_id, name, email, phone, role, gender)
                    VALUES ($1, 'Demo Staff', 'staff@demo.com', '1234567890', 'Admin', 'Male')
                `, [schoolId]);
                console.log('Created Demo Staff profile.');
            }
        }
        client.release();
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkStaffEmail();
