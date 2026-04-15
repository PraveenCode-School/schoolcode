const { pool } = require('../src/config/db');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Running migration: add_exam_type_to_grades...');

        await client.query('BEGIN');

        // Add exam_type_id column
        await client.query(`
            ALTER TABLE grades 
            ADD COLUMN IF NOT EXISTS exam_type_id INTEGER REFERENCES exam_types(id) ON DELETE CASCADE
        `);

        // Create index
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_grades_exam_type ON grades(exam_type_id)
        `);

        await client.query('COMMIT');

        console.log('✅ Migration completed successfully!');
        console.log('Note: Existing grades have NULL exam_type_id. You may want to assign them or delete them.');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate().catch(console.error);
