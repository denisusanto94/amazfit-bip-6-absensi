const pool = require('../config/db');

exports.getShifts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM shifts');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createShift = async (req, res) => {
    const { shift_name, check_in, check_out, late_tolerance_minute } = req.body;
    try {
        await pool.execute('INSERT INTO shifts (shift_name, check_in, check_out, late_tolerance_minute) VALUES (?, ?, ?, ?)',
            [shift_name, check_in, check_out, late_tolerance_minute || 10]);
        res.status(201).json({ message: 'Shift created' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteShift = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM shifts WHERE id = ?', [id]);
        res.json({ message: 'Shift deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateShift = async (req, res) => {
    const { id } = req.params;
    const { shift_name, check_in, check_out, late_tolerance_minute } = req.body;
    try {
        await pool.execute(
            'UPDATE shifts SET shift_name = ?, check_in = ?, check_out = ?, late_tolerance_minute = ? WHERE id = ?',
            [shift_name, check_in, check_out, late_tolerance_minute, id]
        );
        res.json({ message: 'Shift updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
