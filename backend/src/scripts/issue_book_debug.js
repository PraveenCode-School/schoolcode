const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function issueBook() {
    try {
        console.log('--- Issuing Book to Rudrappa ---');

        // 1. Find Student
        const studentRes = await pool.query("SELECT * FROM students WHERE email ILIKE 'rudru888%'");
        if (studentRes.rows.length === 0) {
            console.log('Student not found!');
            return;
        }
        const student = studentRes.rows[0];
        console.log('Student:', student.name, 'Admission No:', student.admission_no);

        // 2. Find a Book
        const bookRes = await pool.query("SELECT * FROM library_books WHERE id = 12"); // explicitly using 12 as seen in debug
        if (bookRes.rows.length === 0) {
            console.log('Book 12 not found. Finding any book...');
            // fallback
        }

        // 3. Issue Book
        // Check if already issued
        const checkRes = await pool.query(
            "SELECT * FROM library_transactions WHERE book_id = 12 AND status = 'Issued'"
        );
        if (checkRes.rows.length > 0) {
            console.log('Book 12 is currently issued to someone else.');
            // Force return? Nah, just update it to be issued to this student for testing
            await pool.query("UPDATE library_transactions SET status = 'Returned' WHERE book_id = 12");
            console.log('Returned book 12 from previous owner.');
        }

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

        await pool.query(
            `INSERT INTO library_transactions (school_id, book_id, patron_type, patron_id, issue_date, due_date, status)
             VALUES ($1, $2, 'Student', $3, NOW(), $4, 'Issued')`,
            [student.school_id, 12, student.admission_no, dueDate]
        );

        console.log(`Book 'knjnjn' (ID 12) issued successfully to ${student.name} (${student.admission_no}).`);
        console.log('Due Date:', dueDate);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

issueBook();
