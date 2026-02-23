const pool = require('../config/db');

// ENUM allowed values
const VALID_TYPE_TRANSUM = ['LRT', 'LRT Jakarta', 'MRT', 'Transjakarta', 'Jaklingko'];
const VALID_CITY = ['Jakarta Pusat', 'Jakarta Timur', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Selatan', 'Bekasi', 'Tangerang Selatan', 'Tangerang', 'Depok', 'Bogor'];

// Get all attendances_transum
exports.getAll = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT at.*, u.name 
            FROM attendances_transum at
            JOIN users u ON at.user_id = u.id
            ORDER BY at.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get single attendance_transum by ID
exports.getById = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT at.*, u.name 
             FROM attendances_transum at
             JOIN users u ON at.user_id = u.id
             WHERE at.id = ?`,
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create new attendance_transum
exports.create = async (req, res) => {
    const {
        user_id,
        check_in, check_in_lat, check_in_long, check_in_photo,
        check_out, check_out_lat, check_out_long, check_out_photo,
        type_transum, city
    } = req.body;

    // Validate ENUM values
    if (!VALID_TYPE_TRANSUM.includes(type_transum)) {
        return res.status(400).json({ message: `Invalid type_transum. Allowed values: ${VALID_TYPE_TRANSUM.join(', ')}` });
    }
    if (!VALID_CITY.includes(city)) {
        return res.status(400).json({ message: `Invalid city. Allowed values: ${VALID_CITY.join(', ')}` });
    }

    try {
        const [result] = await pool.execute(`
            INSERT INTO attendances_transum 
            (user_id, check_in, check_in_lat, check_in_long, check_in_photo,
             check_out, check_out_lat, check_out_long, check_out_photo,
             type_transum, city)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            user_id,
            check_in || null, check_in_lat || null, check_in_long || null, check_in_photo || null,
            check_out || null, check_out_lat || null, check_out_long || null, check_out_photo || null,
            type_transum, city
        ]);

        res.status(201).json({ message: 'Attendance Transum created', id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update attendance_transum
exports.update = async (req, res) => {
    const {
        user_id,
        check_in, check_in_lat, check_in_long, check_in_photo,
        check_out, check_out_lat, check_out_long, check_out_photo,
        type_transum, city
    } = req.body;

    // Validate ENUM values
    if (!VALID_TYPE_TRANSUM.includes(type_transum)) {
        return res.status(400).json({ message: `Invalid type_transum. Allowed values: ${VALID_TYPE_TRANSUM.join(', ')}` });
    }
    if (!VALID_CITY.includes(city)) {
        return res.status(400).json({ message: `Invalid city. Allowed values: ${VALID_CITY.join(', ')}` });
    }

    try {
        await pool.execute(`
            UPDATE attendances_transum SET
                user_id = ?, 
                check_in = ?, check_in_lat = ?, check_in_long = ?, check_in_photo = ?,
                check_out = ?, check_out_lat = ?, check_out_long = ?, check_out_photo = ?,
                type_transum = ?, city = ?
            WHERE id = ?
        `, [
            user_id,
            check_in || null, check_in_lat || null, check_in_long || null, check_in_photo || null,
            check_out || null, check_out_lat || null, check_out_long || null, check_out_photo || null,
            type_transum, city,
            req.params.id
        ]);

        res.json({ message: 'Attendance Transum updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete attendance_transum
exports.remove = async (req, res) => {
    try {
        await pool.execute('DELETE FROM attendances_transum WHERE id = ?', [req.params.id]);
        res.json({ message: 'Attendance Transum deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get valid ENUM options for type_transum and city
exports.getOptions = (req, res) => {
    res.json({
        type_transum: VALID_TYPE_TRANSUM,
        city: VALID_CITY
    });
};
