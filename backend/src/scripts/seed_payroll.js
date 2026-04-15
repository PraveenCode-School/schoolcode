const { pool } = require('../config/db');

async function seedPayroll() {
    try {
        const client = await pool.connect();
        console.log("Seeding data...");

        // Fetch ALL Staff and Teachers with School ID
        const allStaff = await client.query("SELECT id, school_id FROM staff");
        const allTeachers = await client.query("SELECT id, school_id FROM teachers");

        console.log(`Found ${allStaff.rows.length} Staff and ${allTeachers.rows.length} Teachers.`);

        const today = new Date();
        for (let i = 1; i <= 3; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const month = d.getMonth() + 1;
            const year = d.getFullYear();

            // Seed All Staff
            for (const staff of allStaff.rows) {
                const amount = 15000 + (Math.random() * 1000);
                await client.query(`
                    INSERT INTO salary_payments (school_id, employee_id, employee_type, month, year, amount, payment_mode, status, notes, payment_date)
                    VALUES ($1, $2, 'Staff', $3, $4, $5, 'Bank Transfer', 'Paid', 'Salary Credited', $6)
                    ON CONFLICT (school_id, employee_id, employee_type, month, year) DO UPDATE 
                    SET amount = EXCLUDED.amount
                `, [staff.school_id, staff.id, month, year, amount.toFixed(2), d]);
            }

            // Seed All Teachers
            for (const teacher of allTeachers.rows) {
                const amount = 25000 + (Math.random() * 2000);
                await client.query(`
                    INSERT INTO salary_payments (school_id, employee_id, employee_type, month, year, amount, payment_mode, status, notes, payment_date)
                    VALUES ($1, $2, 'Teacher', $3, $4, $5, 'Bank Transfer', 'Paid', 'Salary Credited', $6)
                    ON CONFLICT (school_id, employee_id, employee_type, month, year) DO UPDATE 
                    SET amount = EXCLUDED.amount
                `, [teacher.school_id, teacher.id, month, year, amount.toFixed(2), d]);
            }

            console.log(`Seeded Payroll for ${month}/${year}`);
        }

        client.release();
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

seedPayroll();
