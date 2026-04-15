const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

async function dumpIds() {
    try {
        const res = await pool.query('SELECT admission_no, first_name, last_name FROM students LIMIT 5');
        const output = res.rows.map(r => `${r.admission_no} (${r.first_name})`).join('\n');
        fs.writeFileSync(path.join(__dirname, 'valid_ids.txt'), 'VALID IDS:\n' + output);
    } catch (error) {
        fs.writeFileSync(path.join(__dirname, 'valid_ids.txt'), 'ERROR: ' + error.message);
    } finally {
        pool.end();
    }
}
dumpIds();
