const { pool } = require('../config/db');

async function createHostelFinanceTables() {
    const client = await pool.connect();
    try {
        console.log('Starting hostel finance tables creation...');
        await client.query('BEGIN');

        // Mess Bills Table - To track generated bills
        await client.query(`
            CREATE TABLE IF NOT EXISTS hostel_mess_bills (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(id),
                month VARCHAR(20) NOT NULL, -- e.g., "October"
                year INTEGER NOT NULL,      -- e.g., 2023
                amount DECIMAL(10, 2) NOT NULL,
                status VARCHAR(20) CHECK (status IN ('Pending', 'Paid', 'Partial')) DEFAULT 'Pending',
                generated_date DATE DEFAULT CURRENT_DATE,
                UNIQUE(student_id, month, year)
            );
        `);
        console.log('Created hostel_mess_bills table');

        // Hostel Payments Table - To track actual money received
        await client.query(`
            CREATE TABLE IF NOT EXISTS hostel_payments (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(id),
                amount DECIMAL(10, 2) NOT NULL,
                payment_date DATE DEFAULT CURRENT_DATE,
                payment_type VARCHAR(50) CHECK (payment_type IN ('Room Rent', 'Mess Bill', 'Security Deposit', 'Other')),
                related_bill_id INTEGER REFERENCES hostel_mess_bills(id) ON DELETE SET NULL, -- If paying a specific mess bill
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created hostel_payments table');

        await client.query('COMMIT');
        console.log('All hostel finance tables created successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating hostel finance tables:', error);
    } finally {
        client.release();
        process.exit();
    }
}

createHostelFinanceTables();
