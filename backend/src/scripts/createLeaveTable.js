import { pool } from '../config/db.js';

const createLeaveTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS leaves (
                id SERIAL PRIMARY KEY,
                school_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                role VARCHAR(20) NOT NULL CHECK (role IN ('Student', 'Teacher', 'Staff')),
                leave_type VARCHAR(50) NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                reason TEXT,
                status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Leaves table created successfully.");
    } catch (error) {
        console.error("Error creating leaves table:", error);
    }
};

createLeaveTable();
