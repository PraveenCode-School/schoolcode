const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('🔄 Running academic year tracking migration...');

        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'add_academic_year_tracking.sql'),
            'utf8'
        );

        await pool.query(migrationSQL);

        console.log('✅ Migration completed successfully!');
        console.log('📊 Academic year tracking is now enabled');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
