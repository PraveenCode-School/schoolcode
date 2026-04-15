const { pool } = require('./src/config/db');

async function countTables() {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);

        console.log('\n=== DATABASE TABLES ===\n');
        res.rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.table_name}`);
        });
        console.log(`\n=== TOTAL TABLES: ${res.rows.length} ===\n`);

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        pool.end();
    }
}

countTables();
