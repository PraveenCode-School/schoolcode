const { pool } = require('../config/db');

async function createPayrollSchema() {
    try {
        const client = await pool.connect();
        console.log("Creating Salary Payments Table...");

        await client.query(`
            CREATE TABLE IF NOT EXISTS salary_payments (
                id SERIAL PRIMARY KEY,
                school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
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

        console.log("✅ salary_payments table created.");

        // Insert some dummy data for Rudrappa (Staff) for testing
        console.log("Seeding dummy salary data for Rudrappa...");

        const staffRes = await client.query("SELECT id, salary_per_day FROM staff WHERE name ILIKE '%Rudrappa%' LIMIT 1");

        if (staffRes.rows.length > 0) {
            const staff = staffRes.rows[0];
            const baseSalary = (staff.salary_per_day || 500) * 30; // Approx monthly

            // Insert last 3 months
            const today = new Date();
            for (let i = 1; i <= 3; i++) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const month = d.getMonth() + 1;
                const year = d.getFullYear();

                await client.query(`
                    INSERT INTO salary_payments (school_id, staff_id, month, year, amount, status, remarks)
                    VALUES (
                        (SELECT id FROM schools LIMIT 1),
                        $1, $2, $3, $4, 'Paid', 'Monthly Salary Transfer'
                    )
                    ON CONFLICT (staff_id, month, year) DO NOTHING
                `, [staff.id, month, year, baseSalary]);
                console.log(`Inserted salary for ${month}/${year}`);
            }
        }

        client.release();
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

createPayrollSchema();
