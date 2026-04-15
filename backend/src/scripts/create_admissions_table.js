const { pool } = require('../config/db');

async function ensureAdmissionsTable() {
    const client = await pool.connect();
    try {
        console.log("Checking/Creating admissions_enquiries table...");

        await client.query(`
            CREATE TABLE IF NOT EXISTS admissions_enquiries (
                id SERIAL PRIMARY KEY,
                school_id INTEGER NOT NULL,
                student_name VARCHAR(255) NOT NULL,
                parent_name VARCHAR(255) NOT NULL,
                contact_number VARCHAR(15) NOT NULL,
                email VARCHAR(255),
                class_applying_for VARCHAR(50) NOT NULL,
                previous_school VARCHAR(255),
                status VARCHAR(50) DEFAULT 'New',
                notes TEXT,
                application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("✅ admissions_enquiries table ensured.");

        // Add a sample enquiry for testing
        console.log("Seeding sample enquiry...");
        const schoolRes = await client.query("SELECT id FROM schools LIMIT 1");
        if (schoolRes.rows.length > 0) {
            const schoolId = schoolRes.rows[0].id;
            await client.query(`
                INSERT INTO admissions_enquiries 
                (school_id, student_name, parent_name, contact_number, email, class_applying_for, previous_school, status, notes)
                VALUES ($1, 'Rahul Kumar', 'Mr. Kumar', '9876543210', 'kumar@example.com', 'Class 5', 'ABC School', 'New', 'Good student')
                ON CONFLICT DO NOTHING
            `, [schoolId]);
            console.log("✅ Sample enquiry added.");
        }

    } catch (e) {
        console.error("ERROR:", e);
    } finally {
        client.release();
        process.exit();
    }
}

ensureAdmissionsTable();
