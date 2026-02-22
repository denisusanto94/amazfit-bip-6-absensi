const pool = require('../config/db');

exports.getPermissions = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM permissions');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createPermission = async (req, res) => {
    const { permissions_name } = req.body;
    try {
        await pool.execute('INSERT INTO permissions (permissions_name) VALUES (?)', [permissions_name]);
        res.status(201).json({ message: 'Permission created' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deletePermission = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM permissions WHERE id = ?', [id]);
        res.json({ message: 'Permission deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updatePermission = async (req, res) => {
    const { id } = req.params;
    const { permissions_name } = req.body;
    try {
        await pool.execute('UPDATE permissions SET permissions_name = ? WHERE id = ?', [permissions_name, id]);
        res.json({ message: 'Permission updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
