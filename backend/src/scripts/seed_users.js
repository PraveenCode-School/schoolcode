const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function seedUsers() {
    try {
        const passwordHash = await bcrypt.hash('123456', 10);

        // We need a school ID first.
        const schoolRes = await pool.query('SELECT id FROM schools LIMIT 1');
        let schoolId;
        if (schoolRes.rows.length === 0) {
            console.log('No school found. Please create a school first via Super Admin.');
            return;
        } else {
            schoolId = schoolRes.rows[0].id;
        }

        const users = [
            { email: 'student@demo.com', role: 'STUDENT' },
            { email: 'teacher@demo.com', role: 'TEACHER' },
            { email: 'staff@demo.com', role: 'STAFF' },
            { email: 'driver@demo.com', role: 'DRIVER' }
        ];

        for (const u of users) {
            // Check if exists
            const check = await pool.query('SELECT id FROM users WHERE email = $1', [u.email]);
            if (check.rows.length === 0) {
                await pool.query(
                    'INSERT INTO users (email, password, role, school_id) VALUES ($1, $2, $3, $4)',
                    [u.email, passwordHash, u.role, schoolId]
                );
                console.log(`Created ${u.role}: ${u.email}`);
            } else {
                console.log(`${u.role} already exists: ${u.email}`);
            }
        }

        console.log('--- SEEDING COMPLETE ---');
        console.log('Password for all is: 123456');

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

seedUsers();
