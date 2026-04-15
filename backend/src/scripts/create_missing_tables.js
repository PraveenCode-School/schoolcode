const { pool } = require('../config/db');

async function createMissingTables() {
    const client = await pool.connect();
    try {
        console.log("Creating missing tables...\n");

        // 1. student_attendance table
        console.log("Creating student_attendance...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS student_attendance (
                id SERIAL PRIMARY KEY,
                school_id INTEGER NOT NULL,
                student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                status VARCHAR(20) NOT NULL,
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, date)
            );
        `);
        console.log("✅ student_attendance created");

        // 2. leave_requests table
        console.log("Creating leave_requests...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS leave_requests (
                id SERIAL PRIMARY KEY,
                school_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                user_type VARCHAR(20) NOT NULL, -- 'Student', 'Teacher', 'Staff'
                user_name VARCHAR(255),
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                reason TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
                admin_remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ leave_requests created");

        console.log("\n✅ All missing tables created successfully!");

    } catch (e) {
        console.error("ERROR:", e);
    } finally {
        client.release();
        process.exit();
    }
}

createMissingTables();
