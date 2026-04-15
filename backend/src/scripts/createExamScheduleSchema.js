const { pool } = require('../config/db');

async function createExamScheduleSchema() {
    const client = await pool.connect();
    try {
        console.log('Creating exam schedule schema...');
        await client.query('BEGIN');

        await client.query(`
            CREATE TABLE IF NOT EXISTS exam_schedules (
                id SERIAL PRIMARY KEY,
                school_id INTEGER NOT NULL,
                exam_type_id INTEGER NOT NULL REFERENCES exam_types(id),
                class_id INTEGER NOT NULL REFERENCES classes(id),
                section_id INTEGER NOT NULL REFERENCES sections(id),
                subject_id INTEGER NOT NULL REFERENCES subjects(id),
                exam_date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (school_id) REFERENCES schools(id)
            );
        `);

        // Index for faster queries
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_exam_schedules_lookup 
            ON exam_schedules(school_id, class_id, section_id, exam_type_id);
        `);

        await client.query('COMMIT');
        console.log('✅ Exam schedule schema created successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creating exam schedule schema:', error);
    } finally {
        client.release();
    }
}

if (require.main === module) {
    createExamScheduleSchema()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = createExamScheduleSchema;
