const pool = require('../config/db');

exports.getDivisions = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM divisions');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createDivision = async (req, res) => {
    const { divisions_name } = req.body;
    try {
        await pool.execute('INSERT INTO divisions (divisions_name) VALUES (?)', [divisions_name]);
        res.status(201).json({ message: 'Division created' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteDivision = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM divisions WHERE id = ?', [id]);
        res.json({ message: 'Division deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateDivision = async (req, res) => {
    const { id } = req.params;
    const { divisions_name } = req.body;
    try {
        await pool.execute('UPDATE divisions SET divisions_name = ? WHERE id = ?', [divisions_name, id]);
        res.json({ message: 'Division updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
