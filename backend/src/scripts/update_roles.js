const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function addDriverRole() {
    try {
        console.log('Updating user role constraint...');
        await pool.query("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
        await pool.query("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role::text = ANY (ARRAY['SUPER_ADMIN'::character varying, 'SCHOOL_ADMIN'::character varying, 'TEACHER'::character varying, 'STUDENT'::character varying, 'STAFF'::character varying, 'DRIVER'::character varying]::text[]))");
        console.log('Constraint updated to include DRIVER.');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

addDriverRole();
