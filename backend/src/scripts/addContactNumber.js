const { pool } = require('../config/db');

const addContactNumber = async () => {
    try {
        console.log('🔄 Adding contact_number to schools table...');
        await pool.query(`
            ALTER TABLE schools 
            ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50);
        `);
        console.log('✅ Column contact_number added successfully.');
    } catch (error) {
        console.error('❌ Error adding column:', error);
    } finally {
        pool.end();
    }
};

addContactNumber();
