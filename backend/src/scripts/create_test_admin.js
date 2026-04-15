const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function createSchoolAdmin() {
    try {
        const client = await pool.connect();
        const hashedPassword = await bcrypt.hash('123456', 10);

        // Get school id
        const schoolRes = await client.query('SELECT id FROM schools LIMIT 1');
        const schoolId = schoolRes.rows[0].id;

        // Create or Update User
        await client.query(`
            INSERT INTO users (email, password, role, school_id)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) DO UPDATE SET role = $3, password = $2
        `, ['school_admin@demo.com', hashedPassword, 'SCHOOL_ADMIN', schoolId]);

        console.log('Created school_admin@demo.com / 123456');
        client.release();
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

createSchoolAdmin();
