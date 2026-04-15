const { pool } = require('../config/db');

(async () => {
    try {
        const res = await pool.query('SELECT * FROM subjects');
        console.log('Subjects:', res.rows.length);
        console.log(JSON.stringify(res.rows, null, 2));

        const schoolRes = await pool.query('SELECT id, name FROM schools');
        console.log('Schools:', JSON.stringify(schoolRes.rows, null, 2));

        // specific check for getting subjects for the first school
        if (schoolRes.rows.length > 0) {
            const sid = schoolRes.rows[0].id;
            const subjectsRes = await pool.query(`
                SELECT DISTINCT name 
                FROM subjects 
                WHERE class_id IN (SELECT id FROM classes WHERE school_id = $1)
                ORDER BY name ASC
            `, [sid]);
            console.log(`Subjects for School ${sid}:`, subjectsRes.rows.map(r => r.name));
        }

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
})();
