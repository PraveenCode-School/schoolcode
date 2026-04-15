const { pool } = require('../config/db');

const updateSchema = async () => {
    const client = await pool.connect();
    try {
        console.log('🔄 Updating Student Schema...');

        await client.query('BEGIN');

        // Add new columns if they don't exist
        await client.query(`
            ALTER TABLE students 
            ADD COLUMN IF NOT EXISTS father_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS mother_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS email VARCHAR(255),
            ADD COLUMN IF NOT EXISTS age INTEGER,
            ADD COLUMN IF NOT EXISTS attendance_id VARCHAR(20) UNIQUE,
            ADD COLUMN IF NOT EXISTS roll_number INTEGER;
        `);

        // Migrate existing parent_name to father_name if needed
        await client.query(`
            UPDATE students SET father_name = parent_name WHERE father_name IS NULL;
        `);

        await client.query('COMMIT');
        console.log('✅ Student Schema Updated Successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error updating schema:', error);
    } finally {
        client.release();
        process.exit();
    }
};

updateSchema();
