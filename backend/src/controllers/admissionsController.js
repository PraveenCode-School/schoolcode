const { pool } = require('../config/db');

// Get all enquiries for the school
const getEnquiries = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const result = await pool.query(
            'SELECT * FROM admissions_enquiries WHERE school_id = $1 ORDER BY application_date DESC',
            [schoolId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching enquiries' });
    }
};

// Add a new enquiry
const addEnquiry = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const { student_name, parent_name, contact_number, email, class_applying_for, previous_school, notes } = req.body;

        const result = await pool.query(
            `INSERT INTO admissions_enquiries 
            (school_id, student_name, parent_name, contact_number, email, class_applying_for, previous_school, notes, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'New') RETURNING *`,
            [schoolId, student_name, parent_name, contact_number, email, class_applying_for, previous_school, notes]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding enquiry' });
    }
};

// Update enquiry status
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await pool.query(
            'UPDATE admissions_enquiries SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating status' });
    }
};

// Convert Enquiry to Student (Move to main table)
const convertToStudent = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const schoolId = req.user.schoolId;

        await client.query('BEGIN');

        // 1. Get Enquiry Details
        const enquiryRes = await client.query('SELECT * FROM admissions_enquiries WHERE id = $1 AND school_id = $2', [id, schoolId]);
        if (enquiryRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Enquiry not found' });
        }
        const enquiry = enquiryRes.rows[0];

        // 2. Insert into students table (Basic info transfer)
        // Note: Assuming 'students' table has compatible fields. We map what we have.
        // We might need to generate a temporary admission_number or handle it specifically.
        const admissionNumber = `ADM-${Date.now().toString().slice(-6)}`; // Temp generation

        // Split name for first/last if needed, or just insert as first_name
        const studentRes = await client.query(`
            INSERT INTO students 
            (school_id, first_name, last_name, admission_number, class_name, guardian_name, guardian_phone, status, enrollment_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'Active', CURRENT_DATE)
            RETURNING id`,
            [
                schoolId,
                enquiry.student_name,
                '', // Last Name empty for now
                admissionNumber,
                enquiry.class_applying_for,
                enquiry.parent_name,
                enquiry.contact_number
            ]
        );

        // 3. Update Enquiry Status to 'Admitted'
        await client.query('UPDATE admissions_enquiries SET status = \'Admitted\' WHERE id = $1', [id]);

        await client.query('COMMIT');
        res.json({ message: 'Successfully converted to Student', studentId: studentRes.rows[0].id });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: 'Error converting enquiry' });
    } finally {
        client.release();
    }
};

const deleteEnquiry = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM admissions_enquiries WHERE id = $1', [id]);
        res.json({ message: 'Enquiry deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting enquiry' });
    }
};

module.exports = { getEnquiries, addEnquiry, updateStatus, convertToStudent, deleteEnquiry };
