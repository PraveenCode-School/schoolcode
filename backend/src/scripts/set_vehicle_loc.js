const { pool } = require('../config/db');

async function setVehicleLocation() {
    const client = await pool.connect();
    try {
        const vehicleNum = 'KA-01-F-9999';
        // Set location to somewhere in Bagalkot (since teacher address mentioned Bagalkot)
        // Bagalkot Coordinates: 16.1691° N, 75.6940° E
        const lat = 16.1691;
        const lng = 75.6940;

        const res = await client.query(
            `UPDATE transport_vehicles 
             SET current_lat = $1, current_lng = $2 
             WHERE vehicle_number = $3 RETURNING *`,
            [lat, lng, vehicleNum]
        );

        if (res.rows.length > 0) {
            console.log("Updated vehicle location:", res.rows[0]);
        } else {
            console.log("Vehicle not found!");
        }

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

setVehicleLocation();
