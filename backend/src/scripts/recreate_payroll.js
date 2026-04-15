const { pool } = require('../config/db');

async function recreatePayroll() {
    const client = await pool.connect();
    try {
        console.log("Dropping table...");
        await client.query("DROP TABLE IF EXISTS salary_payments CASCADE");

        console.log("Creating table...");
        await client.query(`
            CREATE TABLE salary_payments (
                id SERIAL PRIMARY KEY,
                school_id INTEGER,
                staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
                month INTEGER NOT NULL,
                year INTEGER NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                payment_date DATE DEFAULT CURRENT_DATE,
                status VARCHAR(20) DEFAULT 'Paid', 
                transaction_ref VARCHAR(100),
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(staff_id, month, year)
            );
        `);
        console.log("Table created.");

        // SEED
        console.log("Seeding...");
        const s = await client.query("SELECT id, school_id FROM staff WHERE name ILIKE '%Rudrappa%' LIMIT 1");
        if (s.rows.length > 0) {
            const { id, school_id } = s.rows[0];

            const months = [
                { m: 11, y: 2024, amt: 15500, rem: 'November Salary' },
                { m: 10, y: 2024, amt: 15500, rem: 'October Salary' },
                { m: 9, y: 2024, amt: 15000, rem: 'September Salary' }
            ];

            for (let rec of months) {
                await client.query(`
                    INSERT INTO salary_payments (school_id, staff_id, month, year, amount, status, remarks)
                    VALUES ($1, $2, $3, $4, $5, 'Paid', $6)
                `, [school_id, id, rec.m, rec.y, rec.amt, rec.rem]);
            }
            console.log("Seeded 3 records.");
        } else {
            console.log("Rudrappa not found for seeding.");
        }

    } catch (e) {
        console.error("ERROR:", e);
    } finally {
        client.release();
        process.exit();
    }
}

recreatePayroll();
