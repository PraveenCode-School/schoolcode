const { pool } = require('../config/db');

async function createPayrollTableForce() {
    const client = await pool.connect();
    try {
        console.log("Creating table force...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.salary_payments (
                id SERIAL PRIMARY KEY,
                school_id INTEGER,
                staff_id INTEGER,
                month INTEGER,
                year INTEGER,
                amount DECIMAL(10, 2),
                status VARCHAR(50),
                payment_date DATE DEFAULT CURRENT_DATE,
                remarks TEXT,
                UNIQUE(staff_id, month, year)
            );
        `);
        console.log("Table created.");

        // Seed
        const s = await client.query("SELECT id, school_id FROM staff WHERE name ILIKE '%Rudrappa%' LIMIT 1");
        if (s.rows.length > 0) {
            const { id, school_id } = s.rows[0];
            await client.query(`
                INSERT INTO salary_payments (school_id, staff_id, month, year, amount, status, remarks)
                VALUES ($1, $2, 10, 2024, 15000, 'Paid', 'Salary Oct')
                ON CONFLICT DO NOTHING
            `, [school_id, id]);
            console.log("Seeded Oct");
            await client.query(`
                INSERT INTO salary_payments (school_id, staff_id, month, year, amount, status, remarks)
                VALUES ($1, $2, 11, 2024, 15000, 'Paid', 'Salary Nov')
                ON CONFLICT DO NOTHING
            `, [school_id, id]);
            console.log("Seeded Nov");
        }

    } catch (e) {
        console.error("ERR:", e);
    } finally {
        client.release();
        process.exit();
    }
}

createPayrollTableForce();
