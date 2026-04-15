const { pool } = require('../config/db');

const updateTeacherSchema = async () => {
    try {
        console.log('🔄 Updating Teacher Schema for Employee ID and Class Teacher...');

        // 1. Add employee_id to teachers if not exists
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teachers' AND column_name='employee_id') THEN 
                    ALTER TABLE teachers ADD COLUMN employee_id VARCHAR(50) UNIQUE;
                END IF;
            END $$;
        `);
        console.log('✅ Employee ID column added to teachers');

        // 2. Add class_teacher_id to sections if not exists
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sections' AND column_name='class_teacher_id') THEN 
                    ALTER TABLE sections ADD COLUMN class_teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL;
                END IF;
            END $$;
        `);
        console.log('✅ Class Teacher ID column added to sections');

    } catch (error) {
        console.error('❌ Error updating schema:', error);
    } finally {
        pool.end();
    }
};

updateTeacherSchema();
