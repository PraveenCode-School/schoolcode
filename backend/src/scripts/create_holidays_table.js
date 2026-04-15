const { pool } = require('../config/db');

async function createHolidaysTable() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Create school_holidays table
        await client.query(`
            CREATE TABLE IF NOT EXISTS school_holidays (
                id SERIAL PRIMARY KEY,
                school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
                holiday_date DATE NOT NULL,
                holiday_name VARCHAR(255) NOT NULL,
                is_paid BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(school_id, holiday_date)
            );
        `);

        console.log('✅ school_holidays table created successfully');

        // Create index for faster queries
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_school_holidays_school_date 
            ON school_holidays(school_id, holiday_date);
        `);

        console.log('✅ Index created on school_holidays');

        await client.query('COMMIT');
        console.log('✅ Holiday management system setup complete!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creating holidays table:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run if called directly
if (require.main === module) {
    createHolidaysTable()
        .then(() => {
            console.log('Migration completed successfully');
            process.exit(0);
        })
        .catch(err => {
            console.error('Migration failed:', err);
            process.exit(1);
        });
}

module.exports = { createHolidaysTable };
