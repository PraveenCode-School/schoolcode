const { pool } = require('../config/db');

async function createTimetableMarksSchema() {
    const client = await pool.connect();
    try {
        console.log('Creating Timetable and Marks Management Schema...');

        await client.query('BEGIN');

        // Timetables Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS timetables (
                id SERIAL PRIMARY KEY,
                school_id INTEGER NOT NULL,
                class_id INTEGER NOT NULL,
                section_id INTEGER NOT NULL,
                day_of_week INTEGER NOT NULL, -- 1=Monday, 2=Tuesday, ..., 6=Saturday
                period_number INTEGER NOT NULL,
                subject_id INTEGER NOT NULL,
                teacher_id INTEGER,
                start_time TIME,
                end_time TIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_timetable_slot UNIQUE (school_id, class_id, section_id, day_of_week, period_number),
                FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
                FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
            );
        `);

        // Exam Types Table (for categorizing marks - Unit Test, Midterm, Final, etc.)
        await client.query(`
            CREATE TABLE IF NOT EXISTS exam_types (
                id SERIAL PRIMARY KEY,
                school_id INTEGER NOT NULL,
                name VARCHAR(100) NOT NULL,
                max_marks INTEGER NOT NULL,
                weightage INTEGER, -- percentage weightage in final grade
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
            );
        `);

        // Marks Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS marks (
                id SERIAL PRIMARY KEY,
                school_id INTEGER NOT NULL,
                student_id INTEGER NOT NULL,
                class_id INTEGER NOT NULL,
                section_id INTEGER NOT NULL,
                subject_id INTEGER NOT NULL,
                exam_type_id INTEGER NOT NULL,
                marks_obtained DECIMAL(5, 2),
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_mark_entry UNIQUE (school_id, student_id, subject_id, exam_type_id),
                FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
                FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                FOREIGN KEY (exam_type_id) REFERENCES exam_types(id) ON DELETE CASCADE
            );
        `);

        // Create indexes for better query performance
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_timetables_class_section 
            ON timetables(school_id, class_id, section_id);
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_timetables_teacher 
            ON timetables(teacher_id, day_of_week, period_number);
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_marks_student 
            ON marks(student_id, exam_type_id);
        `);

        await client.query('COMMIT');
        console.log('✅ Timetable and Marks schema created successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creating schema:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run if called directly
if (require.main === module) {
    createTimetableMarksSchema()
        .then(() => {
            console.log('Schema setup complete');
            process.exit(0);
        })
        .catch(err => {
            console.error('Schema setup failed:', err);
            process.exit(1);
        });
}

module.exports = createTimetableMarksSchema;
