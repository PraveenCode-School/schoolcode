const { pool } = require('../config/db');

exports.getGrades = async (req, res) => {
    try {
        const school_id = req.user.schoolId;
        const { exam_type_id } = req.query;

        let query = 'SELECT * FROM grades WHERE school_id = $1';
        let params = [school_id];

        if (exam_type_id) {
            query += ' AND exam_type_id = $2';
            params.push(exam_type_id);
        }

        query += ' ORDER BY min_percentage DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching grades:', error);
        res.status(500).json({ message: 'Server error fetching grades' });
    }
};

exports.saveGrades = async (req, res) => {
    const client = await pool.connect();
    try {
        const school_id = req.user.schoolId;
        const { grades, exam_type_id } = req.body;

        if (!grades || !Array.isArray(grades)) {
            return res.status(400).json({ message: 'Grades data required' });
        }

        if (!exam_type_id) {
            return res.status(400).json({ message: 'Exam type ID required' });
        }

        await client.query('BEGIN');

        // Delete existing grades for this school and exam type
        await client.query(
            'DELETE FROM grades WHERE school_id = $1 AND exam_type_id = $2',
            [school_id, exam_type_id]
        );

        for (const grade of grades) {
            await client.query(
                `INSERT INTO grades (school_id, exam_type_id, name, min_percentage, max_percentage, grade_point, description)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [school_id, exam_type_id, grade.name, grade.min_percentage, grade.max_percentage, grade.grade_point, grade.description]
            );
        }

        await client.query('COMMIT');
        res.json({ message: 'Grades configuration saved' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error saving grades:', error);
        res.status(500).json({ message: 'Server error saving grades', error: error.message });
    } finally {
        client.release();
    }
};
