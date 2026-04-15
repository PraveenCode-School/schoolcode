const { pool } = require('../config/db');

exports.getMyCertificates = async (req, res) => {
    try {
        const school_id = req.user.schoolId;
        const { email } = req.user;
        let student_id = null;

        // Resolve Student
        let studentRes = await pool.query(
            'SELECT id FROM students WHERE school_id = $1 AND LOWER(email) = LOWER($2)',
            [school_id, email]
        );
        if (studentRes.rows.length === 0) {
            const emailParts = email.split('@');
            if (emailParts.length === 2) {
                studentRes = await pool.query(
                    'SELECT id FROM students WHERE school_id = $1 AND LOWER(admission_no) = LOWER($2)',
                    [school_id, emailParts[0]]
                );
            }
        }
        if (studentRes.rows.length > 0) {
            student_id = studentRes.rows[0].id;
        } else {
            return res.status(404).json({ error: 'Student profile not found' });
        }

        const result = await pool.query(
            `SELECT * FROM student_certificates 
             WHERE student_id = $1 AND school_id = $2 
             ORDER BY issue_date DESC`,
            [student_id, school_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.issueCertificate = async (req, res) => {
    try {
        const { student_id, certificate_type, remarks } = req.body;
        const school_id = req.user.schoolId;

        // Generate a random cert number for now
        const certificate_no = `${certificate_type.substring(0, 3).toUpperCase()}-${Date.now()}`;

        const result = await pool.query(
            `INSERT INTO student_certificates (school_id, student_id, certificate_type, certificate_no, remarks)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [school_id, student_id, certificate_type, certificate_no, remarks]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error issuing certificate:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
