const { pool } = require('../config/db');
const fs = require('fs');
const outputFile = 'latest_student_creds.txt';

async function getLatestStudent() {
    try {
        const studentRes = await pool.query(`
            SELECT s.id, s.name, s.admission_no, s.email, s.school_id, s.class_id, s.section_id
            FROM students s
            ORDER BY s.id DESC
            LIMIT 1
        `);

        let output = '';

        if (studentRes.rows.length > 0) {
            const student = studentRes.rows[0];
            output += `=== Latest Student Created ===\n`;
            output += `Name: ${student.name}\n`;
            output += `ID: ${student.id}\n`;
            output += `Admission No: ${student.admission_no}\n`;
            output += `Email (in Students table): ${student.email}\n`;

            // Try to find the user login
            let userRes = await pool.query(`SELECT email, role FROM users WHERE LOWER(email) = LOWER($1) AND school_id = $2`, [student.email, student.school_id]);

            if (userRes.rows.length === 0) {
                // Try admission no pattern
                const patternEmail = `${student.admission_no}@student.school.com`;
                userRes = await pool.query(`SELECT email, role FROM users WHERE LOWER(email) = LOWER($1) AND school_id = $2`, [patternEmail, student.school_id]);
            }

            if (userRes.rows.length > 0) {
                output += `=== User Credentials ===\n`;
                output += `Login Email: ${userRes.rows[0].email}\n`;
                output += `Role: ${userRes.rows[0].role}\n`;
                output += `Default Password: 123456\n`;
            } else {
                output += `\n!!! No User Login Found for this student !!!\n`;
            }

        } else {
            output += 'No students found in database.\n';
        }

        fs.writeFileSync(outputFile, output);
        console.log('Done writing to ' + outputFile);

    } catch (error) {
        fs.writeFileSync(outputFile, 'Error: ' + error.message);
        console.error('Error fetching student:', error);
    } finally {
        process.exit();
    }
}

getLatestStudent();
