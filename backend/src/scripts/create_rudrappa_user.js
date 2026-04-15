const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function createUserForRudrappa() {
    try {
        const email = 'rudru888@gmail.com';
        const schoolId = 1; // Assuming school ID 1, otherwise fetch from student record
        const password = await bcrypt.hash('123456', 10);

        // Check if user exists
        const check = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (check.rows.length > 0) {
            console.log('User already exists (maybe under different school/role). Updating to STUDENT...');
            await pool.query('UPDATE users SET role = $1, school_id = $2 WHERE email = $3', ['STUDENT', schoolId, email]);
        } else {
            console.log('Creating new user for Rudrappa...');
            await pool.query(
                `INSERT INTO users (email, password, role, school_id) VALUES ($1, $2, 'STUDENT', $3)`,
                [email, password, schoolId]
            );
        }

        console.log('User created/updated successfully.');
        console.log('Email: ' + email);
        console.log('Password: 123456');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
}

createUserForRudrappa();
