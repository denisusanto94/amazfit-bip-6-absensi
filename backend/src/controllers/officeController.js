const pool = require('../config/db');

exports.getOffices = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM offices');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createOffice = async (req, res) => {
    const { office_name, latitude, longitude, radius_meter, address } = req.body;
    try {
        await pool.execute('INSERT INTO offices (office_name, latitude, longitude, radius_meter, address) VALUES (?, ?, ?, ?, ?)',
            [office_name, latitude, longitude, radius_meter || 100, address]);
        res.status(201).json({ message: 'Office created' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteOffice = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM offices WHERE id = ?', [id]);
        res.json({ message: 'Office deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateOffice = async (req, res) => {
    const { id } = req.params;
    const { office_name, latitude, longitude, radius_meter, address } = req.body;
    try {
        await pool.execute(
            'UPDATE offices SET office_name = ?, latitude = ?, longitude = ?, radius_meter = ?, address = ? WHERE id = ?',
            [office_name, latitude, longitude, radius_meter, address, id]
        );
        res.json({ message: 'Office updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
