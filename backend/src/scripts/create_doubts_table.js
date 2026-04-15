const { pool } = require('../config/db');

async function createDoubtsTable() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS doubts (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
                teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
                subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL, 
                question TEXT NOT NULL,
                answer TEXT,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                answered_at TIMESTAMP
            );
        `);
        console.log("Doubts table created successfully.");
    } catch (err) {
        console.error("Error creating doubts table:", err);
    } finally {
        client.release();
        pool.end();
    }
}

createDoubtsTable();
