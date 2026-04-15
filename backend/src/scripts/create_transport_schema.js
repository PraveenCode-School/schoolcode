const { pool } = require('../config/db');

async function createTransportTables() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Creating transport_vehicles table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS transport_vehicles (
                id SERIAL PRIMARY KEY,
                school_id INTEGER REFERENCES schools(id),
                vehicle_number VARCHAR(20) NOT NULL,
                vehicle_model VARCHAR(50),
                driver_name VARCHAR(100),
                driver_phone VARCHAR(20),
                capacity INTEGER,
                status VARCHAR(20) DEFAULT 'Active',
                current_lat DECIMAL(10, 8),
                current_lng DECIMAL(11, 8),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Creating transport_routes table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS transport_routes (
                id SERIAL PRIMARY KEY,
                school_id INTEGER REFERENCES schools(id),
                vehicle_id INTEGER REFERENCES transport_vehicles(id),
                route_name VARCHAR(100) NOT NULL,
                start_point VARCHAR(100),
                end_point VARCHAR(100),
                start_time TIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Creating transport_stops table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS transport_stops (
                id SERIAL PRIMARY KEY,
                route_id INTEGER REFERENCES transport_routes(id) ON DELETE CASCADE,
                stop_name VARCHAR(100) NOT NULL,
                stop_order INTEGER,
                lat DECIMAL(10, 8),
                lng DECIMAL(11, 8),
                pickup_time TIME
            );
        `);

        // Add some dummy data for demonstration if tables were empty
        const vehicleCheck = await client.query('SELECT COUNT(*) FROM transport_vehicles');
        if (parseInt(vehicleCheck.rows[0].count) === 0) {
            console.log('Seeding dummy transport data...');

            // Get a school ID
            const schoolRes = await client.query('SELECT id FROM schools LIMIT 1');
            const schoolId = schoolRes.rows[0]?.id || 1;

            const vehicleRes = await client.query(`
                INSERT INTO transport_vehicles (school_id, vehicle_number, vehicle_model, driver_name, driver_phone, capacity, current_lat, current_lng)
                VALUES 
                ($1, 'KA-01-AB-1234', 'Tata Starbus', 'Ramesh Kumar', '9876543210', 40, 12.9716, 77.5946),
                ($1, 'KA-05-XY-9876', 'Ashok Leyland', 'Suresh Singh', '9123456780', 50, 12.9279, 77.6271)
                RETURNING id;
            `, [schoolId]);

            const bus1Id = vehicleRes.rows[0].id;
            const bus2Id = vehicleRes.rows[1].id;

            const routeRes = await client.query(`
                INSERT INTO transport_routes (school_id, vehicle_id, route_name, start_point, end_point, start_time)
                VALUES 
                ($1, $2, 'Route 1: City Center', 'Majestic', 'School Campus', '07:30:00'),
                ($1, $3, 'Route 2: South Zone', 'Jayanagar', 'School Campus', '07:15:00')
                RETURNING id;
            `, [schoolId, bus1Id, bus2Id]);

            const route1Id = routeRes.rows[0].id;
            const route2Id = routeRes.rows[1].id;

            await client.query(`
                INSERT INTO transport_stops (route_id, stop_name, stop_order, lat, lng, pickup_time)
                VALUES
                ($1, 'Majestic Bus Stand', 1, 12.9767, 77.5713, '07:30:00'),
                ($1, 'Corporation Circle', 2, 12.9664, 77.5873, '07:45:00'),
                ($1, 'School Campus', 3, 12.9716, 77.5946, '08:15:00'),
                ($2, 'Jayanagar 4th Block', 1, 12.9279, 77.5826, '07:15:00'),
                ($2, 'Lalbagh West Gate', 2, 12.9472, 77.5794, '07:35:00'),
                ($2, 'School Campus', 3, 12.9716, 77.5946, '08:10:00');
            `, [route1Id, route2Id]);
        }

        await client.query('COMMIT');
        console.log('Transport tables created successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating transport tables:', error);
    } finally {
        client.release();
        process.exit();
    }
}

createTransportTables();
