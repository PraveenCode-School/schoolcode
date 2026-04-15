const { pool } = require('../config/db');

async function setupHostel() {
    try {
        const studentEmail = 'rudru888@gmail.com';

        // 1. Find Student
        const res = await pool.query("SELECT id, school_id FROM students WHERE email = $1", [studentEmail]);
        if (res.rows.length === 0) {
            console.log('Student not found');
            return;
        }
        const student = res.rows[0];
        const schoolId = student.school_id;

        // 2. Create Hostel if not exists
        let hostelId;
        const hostelRes = await pool.query("SELECT id FROM hostels WHERE school_id = $1 LIMIT 1", [schoolId]);
        if (hostelRes.rows.length > 0) {
            hostelId = hostelRes.rows[0].id;
            console.log('Using existing hostel');
        } else {
            const newHostel = await pool.query(
                "INSERT INTO hostels (school_id, name, type, address, warden_name, contact_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
                [schoolId, 'Main Boys Hostel', 'Boys', 'Campus Block A', 'Warden Suresh', '9876543210']
            );
            hostelId = newHostel.rows[0].id;
            console.log('Created new hostel');
        }

        // 3. Create Room if not exists
        let roomId;
        const roomRes = await pool.query("SELECT id FROM hostel_rooms WHERE hostel_id = $1 AND room_number = $2", [hostelId, '101']);
        if (roomRes.rows.length > 0) {
            roomId = roomRes.rows[0].id;
            console.log('Using existing room 101');
        } else {
            const newRoom = await pool.query(
                "INSERT INTO hostel_rooms (hostel_id, room_number, capacity, cost_per_term) VALUES ($1, $2, $3, $4) RETURNING id",
                [hostelId, '101', 4, 15000]
            );
            roomId = newRoom.rows[0].id;
            console.log('Created new room 101');
        }

        // 4. Allocate Room to Student
        // Check if already allocated
        const allocRes = await pool.query("SELECT id FROM hostel_allocations WHERE student_id = $1 AND status = 'Active'", [student.id]);
        if (allocRes.rows.length === 0) {
            await pool.query(
                "INSERT INTO hostel_allocations (room_id, student_id, allocation_date, status) VALUES ($1, $2, CURRENT_DATE, 'Active')",
                [roomId, student.id]
            );
            console.log('Allocated Room 101 to student');
        } else {
            console.log('Student already allocated to a room');
        }

    } catch (error) {
        console.error(error);
    } finally {
        pool.end();
    }
}

setupHostel();
