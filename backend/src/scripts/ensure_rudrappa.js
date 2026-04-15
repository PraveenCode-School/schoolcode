const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function ensureRudrappa() {
    try {
        const client = await pool.connect();

        // 1. Check if Staff exists
        let staffEmail = 'rudrappa@demo.com';
        const name = 'Rudrappa Machakanur';

        const staffRes = await client.query("SELECT * FROM staff WHERE name ILIKE $1", [`%${name}%`]);

        let staffId;

        if (staffRes.rows.length > 0) {
            console.log(`Found existing staff: ${staffRes.rows[0].name}`);
            staffEmail = staffRes.rows[0].email;
            staffId = staffRes.rows[0].id;
        } else {
            console.log("Creating new staff profile for Rudrappa...");
            // Get school ID
            const schoolRes = await client.query('SELECT id FROM schools LIMIT 1');
            const schoolId = schoolRes.rows[0].id; // Fallback if no school? Assumed exists.

            const newStaff = await client.query(`
                INSERT INTO staff (school_id, name, email, phone, role, gender, join_date, employee_id, salary_per_day, address)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `, [schoolId, name, staffEmail, '9999999999', 'STAFF', 'Male', new Date(), 'S-999', 500, 'Demo Address']);

            staffId = newStaff.rows[0].id;
            console.log("Created Staff ID:", staffId);
        }

        // 2. Ensure User Login exists
        const hashedPassword = await bcrypt.hash('123456', 10);

        // Get school ID (again to be sure)
        const schoolRes = await client.query('SELECT id FROM schools LIMIT 1');
        const schoolId = schoolRes.rows[0].id;

        await client.query(`
            INSERT INTO users (email, password, role, school_id)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) DO UPDATE SET password = $2, role = $3
        `, [staffEmail, hashedPassword, 'STAFF', schoolId]);

        console.log("\n--- CREDENTIALS ---");
        console.log(`Name: ${name}`);
        console.log(`Email: ${staffEmail}`);
        console.log(`Password: 123456`);
        console.log(`Role: STAFF`);
        console.log("-------------------");

        client.release();
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

ensureRudrappa();
