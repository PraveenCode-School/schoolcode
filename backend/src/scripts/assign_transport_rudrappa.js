const { pool } = require('../config/db');

async function assignTransportToRudrappa() {
    try {
        const client = await pool.connect();

        // 1. Find a Route
        console.log("Finding a transport route...");
        const routeRes = await client.query("SELECT * FROM transport_routes LIMIT 1");

        if (routeRes.rows.length === 0) {
            console.log("No routes found! Creating a demo route...");
            // Create vehicle
            const vehicleRes = await client.query(`
                INSERT INTO transport_vehicles (school_id, vehicle_number, vehicle_model, driver_name, driver_phone, capacity, status)
                VALUES ((SELECT id FROM schools LIMIT 1), 'KA-01-AB-1234', 'Tata Starbus', 'Ramesh Driver', '9876543210', 40, 'Active')
                RETURNING *
            `);
            const vehicle = vehicleRes.rows[0];

            // Create route
            const newRoute = await client.query(`
                INSERT INTO transport_routes (school_id, route_name, vehicle_id, start_point, end_point)
                VALUES ($1, 'Route 1 - North City', $2, 'City Center', 'School Campus')
                RETURNING *
            `, [vehicle.school_id, vehicle.id]);

            var route = newRoute.rows[0];
        } else {
            var route = routeRes.rows[0];
        }

        console.log(`Using Route: ${route.route_name} (ID: ${route.id})`);

        // 2. Find Rudrappa
        const staffRes = await client.query("SELECT id FROM staff WHERE name ILIKE '%Rudrappa%' LIMIT 1");
        if (staffRes.rows.length === 0) {
            console.log("Rudrappa not found.");
            process.exit(1);
        }
        const staffId = staffRes.rows[0].id;

        // 3. Update Staff Record
        await client.query(`
            UPDATE staff 
            SET transport_route_id = $1, pickup_point = 'Central Circle Stop'
            WHERE id = $2
        `, [route.id, staffId]);

        console.log(`✅ Assigned Route '${route.route_name}' to Rudrappa.`);

        client.release();
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

assignTransportToRudrappa();
