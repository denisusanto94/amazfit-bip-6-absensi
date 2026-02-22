const pool = require('../config/db');

exports.getHolidays = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM holidays ORDER BY holiday_date ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createHoliday = async (req, res) => {
    const { holiday_name, holiday_date } = req.body;
    try {
        await pool.execute('INSERT INTO holidays (holiday_name, holiday_date) VALUES (?, ?)', [holiday_name, holiday_date]);
        res.status(201).json({ message: 'Holiday created' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM holidays WHERE id = ?', [id]);
        res.json({ message: 'Holiday deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateHoliday = async (req, res) => {
    const { id } = req.params;
    const { holiday_name, holiday_date } = req.body;
    try {
        await pool.execute('UPDATE holidays SET holiday_name = ?, holiday_date = ? WHERE id = ?', [holiday_name, holiday_date, id]);
        res.json({ message: 'Holiday updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
