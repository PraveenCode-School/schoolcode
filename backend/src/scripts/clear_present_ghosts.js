const { pool } = require('../config/db');

async function clearPresentGhosts() {
    const school_id = 1;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const tables = ['teacher_attendance', 'staff_attendance', 'attendance'];
        for (const table of tables) {
            const res = await client.query(`DELETE FROM ${table} WHERE school_id = $1 AND date >= '2026-01-01' AND date <= '2026-12-31' AND status = 'Present'`, [school_id]);
            console.log(`✅ Deleted ${res.rowCount} 'Present' ghosts from ${table}`);
        }

        await client.query('COMMIT');
        console.log('SUCCESS: All "Present" ghosts cleared.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
    } finally {
        client.release();
        process.exit(0);
    }
}

clearPresentGhosts();
