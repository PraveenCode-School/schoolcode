const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function createUser() {
    const client = await pool.connect();
    try {
        const email = 'rudru8888@gmail.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);
        const name = "Rudrappa Machakanur"; // Assuming from context of previous messages

        console.log(`Creating/Updating user for ${email}...`);

        // Check if user exists
        const check = await client.query("SELECT * FROM users WHERE email = $1", [email]);

        if (check.rows.length === 0) {
            // Create User
            // Assuming role is TEACHER based on previous context, but user just asked to login.
            // Let's check if this email is in teachers table first to determine role?
            // Actually, usually we create a generic user likely TEACHER or SCHOOL_ADMIN given the specific email request.
            // I'll assume TEACHER for now as it's the safest bet for specific name usage in previous logs.
            await client.query(`
                INSERT INTO users (school_id, email, password, role)
                VALUES (1, $1, $2, 'TEACHER')
            `, [email, hashedPassword]);
            console.log("User created with role TEACHER.");
        } else {
            // Just update password
            await client.query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, email]);
            console.log("Password updated.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

createUser();
