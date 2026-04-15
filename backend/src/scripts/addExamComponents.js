const { pool } = require('../config/db');

async function addExamComponents() {
    const client = await pool.connect();
    try {
        console.log('Adding exam components support...');

        await client.query('BEGIN');

        // Create exam_components table
        await client.query(`
            CREATE TABLE IF NOT EXISTS exam_components (
                id SERIAL PRIMARY KEY,
                exam_type_id INTEGER NOT NULL,
                component_name VARCHAR(100) NOT NULL,
                max_marks INTEGER NOT NULL,
                display_order INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (exam_type_id) REFERENCES exam_types(id) ON DELETE CASCADE
            );
        `);

        // Create mark_components table to store component-wise marks
        await client.query(`
            CREATE TABLE IF NOT EXISTS mark_components (
                id SERIAL PRIMARY KEY,
                mark_id INTEGER NOT NULL,
                component_id INTEGER NOT NULL,
                marks_obtained DECIMAL(5, 2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (mark_id) REFERENCES marks(id) ON DELETE CASCADE,
                FOREIGN KEY (component_id) REFERENCES exam_components(id) ON DELETE CASCADE,
                CONSTRAINT unique_mark_component UNIQUE (mark_id, component_id)
            );
        `);

        await client.query('COMMIT');
        console.log('✅ Exam components support added successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error adding exam components:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run if called directly
if (require.main === module) {
    addExamComponents()
        .then(() => {
            console.log('Migration complete');
            process.exit(0);
        })
        .catch(err => {
            console.error('Migration failed:', err);
            process.exit(1);
        });
}

module.exports = addExamComponents;
