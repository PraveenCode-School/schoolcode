const { pool } = require('../config/db');

async function updateStaffSchema() {
    try {
        const client = await pool.connect();

        console.log("Updating Staff Schema...");

        // Add transport columns
        const queries = [
            "ALTER TABLE staff ADD COLUMN transport_route_id INTEGER REFERENCES transport_routes(id) ON DELETE SET NULL",
            "ALTER TABLE staff ADD COLUMN pickup_point VARCHAR(255)"
        ];

        for (let q of queries) {
            try {
                await client.query(q);
                console.log("Executed:", q);
            } catch (e) {
                console.log("Skipped (probably exists):", e.message);
            }
        }

        client.release();
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

updateStaffSchema();
