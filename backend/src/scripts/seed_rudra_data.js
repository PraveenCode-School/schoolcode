const { pool } = require('../config/db');

async function seedRudraData() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('🌱 Seeding rich data for Rudrappa (v2)...');

        // 1. Get Student
        const email = 'rudru888@gmail.com';
        const studentRes = await client.query(`SELECT * FROM students WHERE email = $1`, [email]);
        if (studentRes.rows.length === 0) {
            console.log('❌ Student not found!');
            return;
        }
        const student = studentRes.rows[0];
        const schoo_id = student.school_id; // Typo fix expected by reader, but variable is school_id
        const school_id = student.school_id;
        const class_id = student.class_id;
        const section_id = student.section_id;

        console.log(`👤 Student: ${student.name} (ID: ${student.id})`);

        // ---------------------------------------------------------
        // 2. ATTENDANCE (Fill last 15 days)
        // ---------------------------------------------------------
        console.log('📅 Seeding Attendance...');
        await client.query(`DELETE FROM attendance WHERE student_id = $1`, [student.id]);

        const today = new Date();
        for (let i = 14; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const day = date.getDay();
            if (day === 0) continue;

            let status = 'Present';
            if (i === 3) status = 'Absent';
            if (i === 7) status = 'Late';

            const dateStr = date.toISOString().split('T')[0];
            await client.query(`
                INSERT INTO attendance (school_id, student_id, date, status)
                VALUES ($1, $2, $3, $4)
            `, [school_id, student.id, dateStr, status]);
        }

        // ---------------------------------------------------------
        // 3. TRANSPORT
        // ---------------------------------------------------------
        console.log('🚌 Seeding Transport...');
        let routeRes = await client.query(`SELECT id FROM transport_routes WHERE school_id = $1 LIMIT 1`, [school_id]);
        let route_id;
        if (routeRes.rows.length === 0) {
            const newRoute = await client.query(`
                INSERT INTO transport_routes (school_id, route_name, vehicle_number, driver_name, driver_phone)
                VALUES ($1, 'Route 1 - City Loop', 'KA-01-AB-1234', 'Driver Ramesh', '9988776655')
                RETURNING id
            `, [school_id]);
            route_id = newRoute.rows[0].id;
        } else {
            route_id = routeRes.rows[0].id;
        }

        await client.query(`
            UPDATE students 
            SET transport_mode = 'Bus', route_id = $1, pickup_point = 'Main Square'
            WHERE id = $2
        `, [route_id, student.id]);

        // ---------------------------------------------------------
        // 4. FEES (Corrected Schema)
        // ---------------------------------------------------------
        console.log('💰 Seeding Fees...');

        // Create Tuition Fee Structure (Paid)
        let tuitionStruct = await client.query(`
            INSERT INTO fee_structures (school_id, class_id, title, amount, due_date)
            VALUES ($1, $2, 'Tuition Fee - Term 1', 15000, '2025-06-01')
            RETURNING id
        `, [school_id, class_id]);

        // Pay it
        await client.query(`
            INSERT INTO fee_payments (school_id, student_id, fee_structure_id, amount_paid, payment_date, payment_method, remarks)
            VALUES ($1, $2, $3, 15000, '2025-06-05', 'Online', 'Paid in full')
        `, [school_id, student.id, tuitionStruct.rows[0].id]);

        // Create Transport Fee Structure (Pending)
        await client.query(`
            INSERT INTO fee_structures (school_id, class_id, title, amount, due_date)
            VALUES ($1, $2, 'Annual Transport Fee', 5000, '2025-12-10')
        `, [school_id, class_id]);


        // ---------------------------------------------------------
        // 5. LIBRARY
        // ---------------------------------------------------------
        console.log('📚 Seeding Library...');
        let bookRes = await client.query(`SELECT id FROM library_books WHERE school_id = $1 LIMIT 1`, [school_id]);
        let book_id;
        if (bookRes.rows.length === 0) {
            const newBook = await client.query(`
                INSERT INTO library_books (school_id, book_number, title, author, category, status)
                VALUES ($1, 'PHY-101', 'Physics Fundamentals', 'H.C. Verma', 'Science', 'Issued')
                RETURNING id
            `, [school_id]);
            book_id = newBook.rows[0].id;
        } else {
            book_id = bookRes.rows[0].id;
            // Mark it issued
            await client.query(`UPDATE library_books SET status = 'Issued' WHERE id = $1`, [book_id]);
        }

        await client.query(`DELETE FROM library_transactions WHERE patron_id = $1`, [student.admission_no]);
        await client.query(`
            INSERT INTO library_transactions (
                school_id, book_id, patron_type, patron_id, patron_name, issue_date, due_date, status
            ) VALUES (
                $1, $2, 'Student', $3, $4, NOW(), NOW() + INTERVAL '7 days', 'Issued'
            )
        `, [school_id, book_id, student.admission_no, student.name]);

        // ---------------------------------------------------------
        // 6. MARKS / ACADEMICS
        // ---------------------------------------------------------
        console.log('🎓 Seeding Marks...');
        let subjectRes = await client.query(`SELECT id FROM subjects WHERE class_id = $1 LIMIT 1`, [class_id]);
        let subject_id;
        if (subjectRes.rows.length === 0) {
            const newSub = await client.query(`
                INSERT INTO subjects (school_id, class_id, name, type)
                VALUES ($1, $2, 'Mathematics', 'Theory')
                RETURNING id
             `, [school_id, class_id]);
            subject_id = newSub.rows[0].id;
        } else {
            subject_id = subjectRes.rows[0].id;
        }

        let examRes = await client.query(`SELECT id FROM exam_types WHERE school_id = $1 AND name = 'Mid Term' LIMIT 1`, [school_id]);
        let exam_id;
        if (examRes.rows.length === 0) {
            const newExam = await client.query(`
                INSERT INTO exam_types (school_id, name, max_marks)
                VALUES ($1, 'Mid Term', 100)
                RETURNING id
            `, [school_id]);
            exam_id = newExam.rows[0].id;
        } else {
            exam_id = examRes.rows[0].id;
        }

        // Fetch all subjects for the class
        const allSubjectsRes = await client.query(`SELECT id, name FROM subjects WHERE class_id = $1`, [class_id]);

        for (const sub of allSubjectsRes.rows) {
            // Generate random reasonable marks (60-98)
            const randomMarks = Math.floor(Math.random() * (98 - 60 + 1)) + 60;

            await client.query(`
                INSERT INTO marks (school_id, student_id, class_id, section_id, subject_id, exam_type_id, marks_obtained)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (school_id, student_id, subject_id, exam_type_id) 
                DO UPDATE SET marks_obtained = $7
            `, [school_id, student.id, class_id, section_id, sub.id, exam_id, randomMarks]);

            console.log(`   - Seeded ${sub.name}: ${randomMarks}/100`);
        }

        await client.query('COMMIT');
        console.log('✅ All rich data seeded successfully!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding data:', err);
    } finally {
        client.release();
    }
}

seedRudraData();
