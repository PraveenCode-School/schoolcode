const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function resetAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, 'admin@school.com']);
        console.log('✅ Super Admin password reset to: admin123');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

resetAdmin();
