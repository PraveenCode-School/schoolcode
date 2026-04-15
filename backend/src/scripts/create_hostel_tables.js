const { pool } = require('../config/db');

async function createHostelTables() {
    const client = await pool.connect();
    try {
        console.log('Starting hostel tables creation...');
        await client.query('BEGIN');

        // Hostels Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS hostels (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type VARCHAR(20) CHECK (type IN ('Boys', 'Girls', 'Co-ed')),
                address TEXT,
                warden_name VARCHAR(100),
                contact_number VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created hostels table');

        // Hostel Rooms Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS hostel_rooms (
                id SERIAL PRIMARY KEY,
                hostel_id INTEGER REFERENCES hostels(id) ON DELETE CASCADE,
                room_number VARCHAR(20) NOT NULL,
                capacity INTEGER NOT NULL DEFAULT 1,
                cost_per_term DECIMAL(10, 2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(hostel_id, room_number)
            );
        `);
        console.log('Created hostel_rooms table');

        // Hostel Allocations Table
        // Checking if students table exists to add FK constraint, otherwise just integer
        // Ideally we should have FK.
        await client.query(`
            CREATE TABLE IF NOT EXISTS hostel_allocations (
                id SERIAL PRIMARY KEY,
                room_id INTEGER REFERENCES hostel_rooms(id) ON DELETE CASCADE,
                student_id INTEGER REFERENCES students(id), 
                allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
                vacating_date DATE,
                status VARCHAR(20) CHECK (status IN ('Active', 'Vacated')) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created hostel_allocations table');

        await client.query('COMMIT');
        console.log('All hostel tables created successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating hostel tables:', error);
    } finally {
        client.release();
        process.exit();
    }
}

createHostelTables();
