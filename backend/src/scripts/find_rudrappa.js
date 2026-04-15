const { pool } = require('../config/db');

async function findStaffCredential() {
    try {
        const client = await pool.connect();

        console.log("Searching for 'Rudrappa' in staff...");
        const res = await client.query("SELECT * FROM staff WHERE name ILIKE '%Rudrappa%'");

        if (res.rows.length > 0) {
            console.log("Found Staff:");
            console.table(res.rows);

            // Check user table for this email
            const email = res.rows[0].email;
            const userRes = await client.query("SELECT * FROM users WHERE email = $1", [email]);
            console.log("\nUser Credentials:");
            if (userRes.rows.length > 0) {
                console.table(userRes.rows);
                console.log("\nPassword is likely generic '123456' if it's a demo user, or hashed.");
            } else {
                console.log("No user login found for this staff email.");
            }
        } else {
            console.log("No staff found with name 'Rudrappa'.");
        }

        client.release();
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

findStaffCredential();
