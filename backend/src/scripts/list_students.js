const { pool } = require('../config/db');

async function listStudents() {
    try {
        const res = await pool.query('SELECT id, first_name, last_name, admission_no FROM students LIMIT 10');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        pool.end();
    }
}

listStudents();
