const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function listUsers() {
    try {
        const res = await pool.query("SELECT id, email, role FROM users");
        console.log('--- ALL USERS ---');
        res.rows.forEach(u => {
            console.log(`ID: ${u.id}, Role: ${u.role}, Email: ${u.email}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

listUsers();
