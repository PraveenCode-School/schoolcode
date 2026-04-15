const { pool } = require('../config/db');

async function createTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS student_certificates (
                id SERIAL PRIMARY KEY,
                school_id INTEGER,
                student_id INTEGER REFERENCES students(id),
                certificate_type VARCHAR(50) NOT NULL,
                issue_date DATE DEFAULT CURRENT_DATE,
                certificate_no VARCHAR(50),
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Certificate table created successfully.");
    } catch (error) {
        console.error("Error creating table:", error);
    } finally {
        pool.end();
    }
}

createTable();
