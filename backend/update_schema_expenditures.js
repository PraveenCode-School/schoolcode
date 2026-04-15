const { pool } = require('./src/config/db');

async function updateSchema() {
    try {
        const client = await pool.connect();
        console.log('--- Updating Expenditures Table Schema ---');

        await client.query(`
            ALTER TABLE expenditures 
            ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100),
            ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100);
        `);

        console.log('✅ Added transaction_id and upi_id columns.');

        client.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating schema:', error);
        process.exit(1);
    }
}

updateSchema();
