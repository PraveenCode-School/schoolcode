const { pool } = require('../config/db');

const createTeacherStaffSchema = async () => {
    try {
        console.log('🔄 Initializing Teacher & Staff Schema...');

        // 1. Teachers Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS teachers (
                id SERIAL PRIMARY KEY,
                school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(20),
                subject_specialization VARCHAR(255),
                gender VARCHAR(10),
                join_date DATE DEFAULT CURRENT_DATE,
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Teachers table ready');

        // 2. Staff Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS staff (
                id SERIAL PRIMARY KEY,
                school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(20),
                role VARCHAR(100),
                gender VARCHAR(10),
                join_date DATE DEFAULT CURRENT_DATE,
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Staff table ready');

        // 3. Teacher Attendance
        await pool.query(`
            CREATE TABLE IF NOT EXISTS teacher_attendance (
                id SERIAL PRIMARY KEY,
                school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
                teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                status VARCHAR(10) CHECK (status IN ('Present', 'Absent', 'Late', 'Leave')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(teacher_id, date)
            );
        `);
        console.log('✅ Teacher Attendance table ready');

        // 4. Staff Attendance
        await pool.query(`
            CREATE TABLE IF NOT EXISTS staff_attendance (
                id SERIAL PRIMARY KEY,
                school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
                staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                status VARCHAR(10) CHECK (status IN ('Present', 'Absent', 'Late', 'Leave')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(staff_id, date)
            );
        `);
        console.log('✅ Staff Attendance table ready');

    } catch (error) {
        console.error('❌ Error creating schema:', error);
    } finally {
        pool.end();
    }
};

createTeacherStaffSchema();
