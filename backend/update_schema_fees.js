const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const updateSchema = async () => {
    try {
        console.log('Connecting to DB...');
        const client = await pool.connect();

        console.log('Adding type column to fee_structures...');
        // Check if column exists first to be safe (or just try add)
        try {
            await client.query(`ALTER TABLE fee_structures ADD COLUMN type VARCHAR(20) DEFAULT 'CLASS_DEFAULT'`);
            console.log('Column added.');
        } catch (e) {
            console.log('Column might already exist:', e.message);
        }

        console.log('Creating student_fees table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS student_fees (
                id SERIAL PRIMARY KEY,
                school_id INTEGER REFERENCES schools(id),
                student_id INTEGER REFERENCES students(id),
                fee_structure_id INTEGER REFERENCES fee_structures(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, fee_structure_id)
            )
        `);
        console.log('Table created.');

        client.release();
        console.log('Done.');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
};

updateSchema();
