const { pool } = require('../config/db');

async function listValidStudents() {
    try {
        const res = await pool.query('SELECT admission_no, first_name FROM students LIMIT 5');
        console.log('VALID_IDS_START');
        res.rows.forEach(r => console.log(`${r.admission_no} (${r.first_name})`));
        console.log('VALID_IDS_END');
    } catch (error) {
        console.error(error);
    } finally {
        pool.end();
    }
}
listValidStudents();
