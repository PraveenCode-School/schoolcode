const { pool } = require('../config/db');

const up = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('Creating Library Management Tables...');

        // 1. Library Books Table
        // Stores individual book copies. 'book_number' is the unique Accession Number.
        await client.query(`
            CREATE TABLE IF NOT EXISTS library_books (
                id SERIAL PRIMARY KEY,
                school_id INTEGER NOT NULL REFERENCES schools(id),
                book_number VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255),
                category VARCHAR(100),
                status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Issued', 'Lost', 'Maintenance')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(school_id, book_number)
            );
        `);

        // 2. Library Transactions Table
        // Records issues and returns.
        await client.query(`
            CREATE TABLE IF NOT EXISTS library_transactions (
                id SERIAL PRIMARY KEY,
                school_id INTEGER NOT NULL REFERENCES schools(id),
                book_id INTEGER NOT NULL REFERENCES library_books(id),
                patron_type VARCHAR(20) NOT NULL CHECK (patron_type IN ('Student', 'Teacher', 'Staff')),
                patron_id VARCHAR(50) NOT NULL, -- specific ID (Admission No or Employee ID)
                patron_name VARCHAR(100), -- Snapshot of name at time of issue
                issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                due_date TIMESTAMP,
                return_date TIMESTAMP,
                status VARCHAR(20) DEFAULT 'Issued' CHECK (status IN ('Issued', 'Returned')),
                fine_amount DECIMAL(10, 2) DEFAULT 0.00,
                remarks TEXT
            );
        `);

        await client.query('COMMIT');
        console.log('Library tables created successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating library tables:', error);
    } finally {
        client.release();
    }
};

up().then(() => process.exit());
