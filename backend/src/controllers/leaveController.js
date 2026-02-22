const pool = require('../config/db');

exports.getLeaves = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT l.*, u.name as user_name, admin.name as approved_by_name
            FROM leaves l
            JOIN users u ON l.user_id = u.id
            LEFT JOIN users admin ON l.approved_by = admin.id
            ORDER BY l.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createLeave = async (req, res) => {
    const { user_id, leave_type, start_date, end_date, reason } = req.body;
    try {
        await pool.execute(
            'INSERT INTO leaves (user_id, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)',
            [user_id, leave_type, start_date, end_date, reason]
        );
        res.status(201).json({ message: 'Leave request created' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const approved_by = req.userId; // Assuming verifyToken gives req.userId
    try {
        await pool.execute(
            'UPDATE leaves SET status = ?, approved_by = ? WHERE id = ?',
            [status, approved_by, id]
        );
        res.json({ message: `Leave ${status}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteLeave = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM leaves WHERE id = ?', [id]);
        res.json({ message: 'Leave record deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
