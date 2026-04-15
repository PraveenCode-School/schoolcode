const { pool } = require('../config/db');

async function listValidStudents() {
    try {
        console.log('--- Fetching Valid Student IDs ---');
        const res = await pool.query('SELECT id, admission_no, first_name, last_name, class_id FROM students ORDER BY id LIMIT 5');

        if (res.rows.length === 0) {
            console.log('NO STUDENTS FOUND IN DATABASE!');
        } else {
            console.table(res.rows);
            console.log('\nTry using one of the "admission_no" values above exactly as shown.');
        }

        // Also check if there are any trailing spaces
        const spaceCheck = await pool.query("SELECT admission_no FROM students WHERE admission_no LIKE '% ' OR admission_no LIKE ' %'");
        if (spaceCheck.rows.length > 0) {
            console.log('\nWARNING: Found students with spaces in admission_no:', spaceCheck.rows);
        }

    } catch (error) {
        console.error(error);
    } finally {
        pool.end();
    }
}

listValidStudents();
