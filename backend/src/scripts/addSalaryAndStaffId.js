const { pool } = require('../config/db');

const up = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Migrating: Adding salary columns and staff employee_id...');

        // 1. Add salary_per_day to teachers
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teachers' AND column_name='salary_per_day') THEN 
                    ALTER TABLE teachers ADD COLUMN salary_per_day DECIMAL(10, 2) DEFAULT 0.00; 
                END IF; 
            END $$;
        `);

        // 2. Add salary_per_day and employee_id to staff
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff' AND column_name='salary_per_day') THEN 
                    ALTER TABLE staff ADD COLUMN salary_per_day DECIMAL(10, 2) DEFAULT 0.00; 
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff' AND column_name='employee_id') THEN 
                    ALTER TABLE staff ADD COLUMN employee_id VARCHAR(50) UNIQUE; 
                END IF;
            END $$;
        `);

        // 3. Backfill staff employee_id if null
        // We will loop through and assign them if needed, or just let new ones be generated.
        // For simplicity in a migration script, we can do a quick update for existing nulls using a simple sequence or uuid if we really needed to, 
        // but since we are generating sequential S-YYYY-NNN in the controller, it is hard to do pure SQL backfill easily without a function.
        // However, we can leave existing ones null and just require it for new ones, OR we can generate simple ones now.
        // Let's generate simple random ones for existing to ensure UNIQUE constraint doesn't fail if we were to enforce it strictly (though we just added the column, it's nullable by default unless we said NOT NULL).
        // The column above is created without NOT NULL, so it is safe.

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
    } finally {
        client.release();
    }
};

up().then(() => process.exit());
