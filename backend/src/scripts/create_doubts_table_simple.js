const { pool } = require('../config/db');

async function createDoubtsTable() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS doubts (
                id SERIAL PRIMARY KEY,
                student_id INTEGER,
                teacher_id INTEGER,
                subject_id INTEGER, 
                question TEXT NOT NULL,
                answer TEXT,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                answered_at TIMESTAMP
            );
        `);
        console.log("Doubts table created successfully (no FKs yet).");
    } catch (err) {
        console.error("Error creating doubts table:", err);
    } finally {
        client.release();
        pool.end();
    }
}

createDoubtsTable();
