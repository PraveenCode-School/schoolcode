const { pool } = require('../config/db');

async function createTableOnly() {
    try {
        const client = await pool.connect();
        console.log("Creating Salary Payments Table Only...");

        await client.query(`
            CREATE TABLE IF NOT EXISTS salary_payments (
                id SERIAL PRIMARY KEY,
                school_id INTEGER,
                staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
                month INTEGER NOT NULL,
                year INTEGER NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                payment_date DATE DEFAULT CURRENT_DATE,
                status VARCHAR(20) DEFAULT 'Paid', 
                transaction_ref VARCHAR(100),
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(staff_id, month, year)
            );
        `);
        console.log("✅ salary_payments table created.");
        client.release();
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

createTableOnly();
