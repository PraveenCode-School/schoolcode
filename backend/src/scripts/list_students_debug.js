const { pool } = require('../config/db');

async function debugStudents() {
    try {
        const res = await pool.query(`
            SELECT s.id, s.name, s.email, s.admission_no, s.school_id 
            FROM students s 
            ORDER BY s.id DESC
        `);
        console.log("Students Table:");
        console.table(res.rows);

        const resUsers = await pool.query(`
            SELECT id, email, role, school_id 
            FROM users 
            WHERE role = 'STUDENT'
            ORDER BY id DESC
        `);
        console.log("\nUsers Table (Students):");
        console.table(resUsers.rows);
    } catch (err) {
        console.error(err);
    }
}

debugStudents();
