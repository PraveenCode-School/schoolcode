const { pool } = require('../config/db');
const fs = require('fs');
const outputFile = 'teacher_creds.txt';

async function getTeacherCreds() {
    try {
        // Fetch valid teacher logins
        const res = await pool.query(`
            SELECT u.email, u.role, t.name, t.employee_id
            FROM users u
            JOIN teachers t ON LOWER(t.email) = LOWER(u.email)
            WHERE u.role = 'TEACHER'
            LIMIT 5
        `);

        let output = '';

        if (res.rows.length > 0) {
            output += `=== Teacher Credentials ===\n`;
            res.rows.forEach((t, i) => {
                output += `\n[Teacher ${i + 1}]\n`;
                output += `Name: ${t.name}\n`;
                output += `Login Email: ${t.email}\n`;
                output += `Role: ${t.role}\n`;
                output += `Employee ID: ${t.employee_id}\n`;
                output += `Default Password: 123456\n`;
            });
        } else {
            // Try fetching ANY teacher user even if not strictly linked to teacher table (though they should be)
            const fallbackRes = await pool.query(`SELECT email, role FROM users WHERE role = 'TEACHER' LIMIT 5`);
            if (fallbackRes.rows.length > 0) {
                output += `=== Generic Teacher Logins (No Profile Found?) ===\n`;
                fallbackRes.rows.forEach(u => {
                    output += `Email: ${u.email} (Default Pass: 123456)\n`;
                });
            } else {
                output += 'No teacher accounts found.\n';
            }
        }

        fs.writeFileSync(outputFile, output);
        console.log('Done writing to ' + outputFile);

    } catch (error) {
        fs.writeFileSync(outputFile, 'Error: ' + error.message);
        console.error('Error fetching teachers:', error);
    } finally {
        process.exit();
    }
}

getTeacherCreds();
