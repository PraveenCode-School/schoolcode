const { pool } = require('../config/db');

// Expenditures
exports.getExpenditures = async (req, res) => {
    try {
        const school_id = req.user.schoolId;
        const { start_date, end_date, limit } = req.query;

        let query = `SELECT * FROM expenditures WHERE school_id = $1`;
        const params = [school_id];

        if (start_date && end_date) {
            query += ` AND expense_date BETWEEN $${params.length + 1} AND $${params.length + 2}`;
            params.push(start_date, end_date);
        }

        query += ` ORDER BY expense_date DESC, created_at DESC`;

        if (limit) {
            query += ` LIMIT $${params.length + 1}`;
            params.push(limit);
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching expenditures:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addExpenditure = async (req, res) => {
    try {
        const school_id = req.user.schoolId;
        const { title, amount, category, description, expense_date, payment_method, transaction_id, upi_id } = req.body;

        const result = await pool.query(
            `INSERT INTO expenditures (school_id, title, amount, category, description, expense_date, payment_method, transaction_id, upi_id, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [school_id, title, amount, category, description, expense_date || new Date(), payment_method, transaction_id, upi_id, req.user.id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding expenditure:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteExpenditure = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM expenditures WHERE id = $1 AND school_id = $2', [id, req.user.schoolId]);
        res.json({ message: 'Expenditure deleted' });
    } catch (error) {
        console.error('Error deleting expenditure:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getExpenditureStats = async (req, res) => {
    try {
        const school_id = req.user.schoolId;
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const todayStats = await pool.query(
            `SELECT SUM(amount) as total FROM expenditures WHERE school_id = $1 AND expense_date = $2`,
            [school_id, today]
        );

        const monthStats = await pool.query(
            `SELECT SUM(amount) as total FROM expenditures 
             WHERE school_id = $1 AND EXTRACT(MONTH FROM expense_date) = $2 AND EXTRACT(YEAR FROM expense_date) = $3`,
            [school_id, currentMonth, currentYear]
        );

        const yearStats = await pool.query(
            `SELECT SUM(amount) as total FROM expenditures 
             WHERE school_id = $1 AND EXTRACT(YEAR FROM expense_date) = $2`,
            [school_id, currentYear]
        );

        res.json({
            today: parseFloat(todayStats.rows[0].total || 0),
            month: parseFloat(monthStats.rows[0].total || 0),
            year: parseFloat(yearStats.rows[0].total || 0)
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
