// Script to issue a test certificate to the demo student
const { pool } = require('../config/db');

async function issueTestCertificate() {
    try {
        const studentEmail = 'rudru888@gmail.com';

        // Find Student
        const res = await pool.query("SELECT id, school_id FROM students WHERE email = $1", [studentEmail]);
        if (res.rows.length === 0) {
            console.log('Student not found');
            return;
        }

        const student = res.rows[0];

        // Issue Certificate
        await pool.query(
            "INSERT INTO student_certificates (school_id, student_id, certificate_type, certificate_no, remarks) VALUES ($1, $2, $3, $4, $5)",
            [student.school_id, student.id, 'Bonafide', 'BON-TEST-001', 'Issued for test purposes']
        );

        console.log('Certificate Issued Successfully!');

    } catch (error) {
        console.error(error);
    } finally {
        pool.end();
    }
}

issueTestCertificate();
