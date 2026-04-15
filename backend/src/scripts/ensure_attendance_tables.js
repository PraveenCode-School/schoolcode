const { pool } = require('../config/db');

async function ensureAttendanceTables() {
    const client = await pool.connect();
    try {
        console.log('Creating attendance tables if they don\'t exist...');

        // Create teacher_attendance table
        await client.query(`
            CREATE TABLE IF NOT EXISTS teacher_attendance (
                id SERIAL PRIMARY KEY,
                school_id INTEGER NOT NULL,
                teacher_id INTEGER NOT NULL,
                date DATE NOT NULL,
                status VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(teacher_id, date)
            );
        `);
        console.log('✅ teacher_attendance table ready');

        // Create staff_attendance table
        await client.query(`
            CREATE TABLE IF NOT EXISTS staff_attendance (
                id SERIAL PRIMARY KEY,
                school_id INTEGER NOT NULL,
                staff_id INTEGER NOT NULL,
                date DATE NOT NULL,
                status VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(staff_id, date)
            );
        `);
        console.log('✅ staff_attendance table ready');

        // Check counts
        const teacherCount = await client.query('SELECT COUNT(*) FROM teachers');
        const staffCount = await client.query('SELECT COUNT(*) FROM staff');
        const holidayCount = await client.query('SELECT COUNT(*) FROM school_holidays');

        console.log('\n📊 Current Data:');
        console.log(`   Teachers: ${teacherCount.rows[0].count}`);
        console.log(`   Staff: ${staffCount.rows[0].count}`);
        console.log(`   Holidays: ${holidayCount.rows[0].count}`);

        if (parseInt(teacherCount.rows[0].count) === 0 && parseInt(staffCount.rows[0].count) === 0) {
            console.log('\n⚠️  WARNING: No teachers or staff found!');
            console.log('   You need to add at least one teacher or staff member before auto-marking holidays.');
        } else {
            console.log('\n✅ Ready to auto-mark holidays!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        process.exit(0);
    }
}

// Run if called directly
if (require.main === module) {
    ensureAttendanceTables();
}

module.exports = { ensureAttendanceTables };
