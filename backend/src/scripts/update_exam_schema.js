const { pool } = require('../config/db');

async function updateSchema() {
    try {
        const client = await pool.connect();

        console.log('Adding missing columns to exam_types...');

        // min_marks
        try {
            await client.query(`ALTER TABLE exam_types ADD COLUMN IF NOT EXISTS min_marks INTEGER DEFAULT 35`);
            console.log('Added min_marks');
        } catch (e) { console.log('min_marks exists or error', e.message); }

        // start_month
        try {
            await client.query(`ALTER TABLE exam_types ADD COLUMN IF NOT EXISTS start_month INTEGER DEFAULT 1`);
            console.log('Added start_month');
        } catch (e) { console.log('start_month exists or error', e.message); }

        // end_month
        try {
            await client.query(`ALTER TABLE exam_types ADD COLUMN IF NOT EXISTS end_month INTEGER DEFAULT 12`);
            console.log('Added end_month');
        } catch (e) { console.log('end_month exists or error', e.message); }

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

updateSchema();
