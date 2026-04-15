const { pool } = require('../config/db');

async function updateStaffIds() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Find staff with null employee_id
        const res = await client.query('SELECT id FROM staff WHERE employee_id IS NULL');

        for (const row of res.rows) {
            let employee_id;
            let isUnique = false;

            // Loop until unique ID found
            while (!isUnique) {
                employee_id = Math.floor(100000 + Math.random() * 900000).toString();
                const check = await client.query('SELECT 1 FROM staff WHERE employee_id = $1', [employee_id]);
                if (check.rows.length === 0) isUnique = true;
            }

            await client.query('UPDATE staff SET employee_id = $1 WHERE id = $2', [employee_id, row.id]);
            console.log(`Updated Staff ID ${row.id} with Employee ID: ${employee_id}`);
        }

        await client.query('COMMIT');
        console.log('All missing staff IDs generated.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
    } finally {
        client.release();
        process.exit();
    }
}

updateStaffIds();
