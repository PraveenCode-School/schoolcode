const { pool } = require('../config/db');

async function getStudentDetails() {
    try {
        const res = await pool.query('SELECT * FROM students WHERE id = 1');
        console.log(JSON.stringify(res.rows[0], null, 2));
    } catch (e) { console.error(e); } finally { pool.end(); }
}
getStudentDetails();
