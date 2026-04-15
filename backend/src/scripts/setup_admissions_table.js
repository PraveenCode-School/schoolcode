const { pool } = require('../config/db');

const setupAdmissionsTable = async () => {
    try {
        console.log('Setting up admissions_enquiries table...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS admissions_enquiries (
                id SERIAL PRIMARY KEY,
                school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
                student_name VARCHAR(100) NOT NULL,
                parent_name VARCHAR(100) NOT NULL,
                contact_number VARCHAR(15) NOT NULL,
                email VARCHAR(100),
                class_applying_for VARCHAR(50) NOT NULL,
                previous_school VARCHAR(200),
                status VARCHAR(20) DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Interview', 'Selected', 'Admitted', 'Rejected')),
                notes TEXT,
                application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Successfully created admissions_enquiries table.');
    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        await pool.end();
    }
};

setupAdmissionsTable();
