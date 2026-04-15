const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const fs = require('fs');
const outputFile = 'reset_teacher_out.txt';

async function resetTeacherPassword() {
    let output = '';
    try {
        const email = 'rudru8888@gmail.com';
        const newPassword = await bcrypt.hash('123456', 10);

        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (res.rows.length === 0) {
            output += `User with email ${email} DOES NOT EXIST.\n`;
            // Attempt to create it if missing but associated teacher exists?
            // Checking if teacher exists first
            const teacherRes = await pool.query('SELECT * FROM teachers WHERE email = $1', [email]);
            if (teacherRes.rows.length > 0) {
                output += `Teacher profile found. Creating user user...\n`;
                const t = teacherRes.rows[0];
                await pool.query('INSERT INTO users (email, password, role, school_id) VALUES ($1, $2, $3, $4)',
                    [email, newPassword, 'TEACHER', t.school_id]);
                output += `User created for teacher.\n`;
            }

        } else {
            const user = res.rows[0];
            output += `Found User: ID=${user.id}, Role=${user.role}, School=${user.school_id}\n`;

            await pool.query('UPDATE users SET password = $1, role = $2 WHERE email = $3', [newPassword, 'TEACHER', email]);
            output += 'Password reset to 123456 successfully.\n';
        }

    } catch (error) {
        output += 'Error: ' + error.message + '\n';
        console.error(error);
    } finally {
        fs.writeFileSync(outputFile, output);
        // console.log(output);
        pool.end();
    }
}

resetTeacherPassword();
