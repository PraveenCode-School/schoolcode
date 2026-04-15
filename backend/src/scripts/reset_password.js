const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function resetPassword() {
    const client = await pool.connect();
    try {
        const email = 'rudru8888@gmail.com';
        const newPassword = 'password123'; // Default weak password for dev
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Check if user exists
        const check = await client.query("SELECT * FROM users WHERE email = $1", [email]);

        if (check.rows.length === 0) {
            console.log(`User ${email} not found!`);
        } else {
            await client.query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, email]);
            console.log(`Password for ${email} has been updated to: ${newPassword}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

resetPassword();
