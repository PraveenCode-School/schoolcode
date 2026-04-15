const { pool } = require('../config/db');
const fs = require('fs');

async function listStudents() {
    try {
        const res = await pool.query('SELECT id, first_name, last_name, admission_no FROM students');
        const data = JSON.stringify(res.rows, null, 2);
        fs.writeFileSync('students_list.json', data, 'utf8');
        console.log('Written to students_list.json');
    } catch (error) {
        console.error(error);
    } finally {
        pool.end();
    }
}

listStudents();
