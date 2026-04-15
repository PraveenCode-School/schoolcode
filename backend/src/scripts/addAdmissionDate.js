const { pool } = require('../config/db');

const addAdmissionDate = async () => {
    const client = await pool.connect();
    try {
        console.log('🔄 Adding Admission Date to Students table...');
        await client.query('BEGIN');

        // Add admission_date column
        await client.query(`
            ALTER TABLE students 
            ADD COLUMN IF NOT EXISTS admission_date DATE DEFAULT CURRENT_DATE;
        `);

        await client.query('COMMIT');
        console.log('✅ Admission Date column added successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error updating schema:', error);
    } finally {
        client.release();
        process.exit();
    }
};

addAdmissionDate();
