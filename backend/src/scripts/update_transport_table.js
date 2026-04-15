const { pool } = require('../config/db');

async function updateTransportTable() {
    const client = await pool.connect();
    try {
        console.log('Adding driver_id and gps_device_id to transport_vehicles...');

        await client.query(`
            ALTER TABLE transport_vehicles 
            ADD COLUMN IF NOT EXISTS driver_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS gps_device_id VARCHAR(50);
        `);

        console.log('Successfully updated transport_vehicles table.');
    } catch (error) {
        console.error('Error updating transport_vehicles table:', error);
    } finally {
        client.release();
        process.exit();
    }
}

updateTransportTable();
