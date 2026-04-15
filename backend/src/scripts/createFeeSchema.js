const { pool } = require('../config/db');

const up = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('Creating Fee Management Tables...');

        // 1. Fee Structures Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS fee_structures (
                id SERIAL PRIMARY KEY,
                school_id INTEGER NOT NULL REFERENCES schools(id),
                class_id INTEGER NOT NULL REFERENCES classes(id),
                title VARCHAR(100) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                due_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Student Payments Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS fee_payments (
                id SERIAL PRIMARY KEY,
                school_id INTEGER NOT NULL REFERENCES schools(id),
                student_id INTEGER NOT NULL REFERENCES students(id),
                fee_structure_id INTEGER NOT NULL REFERENCES fee_structures(id) ON DELETE CASCADE,
                amount_paid DECIMAL(10, 2) NOT NULL,
                payment_date DATE DEFAULT CURRENT_DATE,
                payment_method VARCHAR(50),
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query('COMMIT');
        console.log('Fee tables created successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating fee tables:', error);
    } finally {
        client.release();
    }
};

up().then(() => process.exit());
