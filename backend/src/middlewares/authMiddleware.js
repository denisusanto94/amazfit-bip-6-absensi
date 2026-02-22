const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(500).json({ message: 'Failed to authenticate token' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin' && req.userRole !== 'super_admin') {
        return res.status(403).json({ message: 'Admin role required' });
    }
    next();
};

const hasPermission = (permission) => {
    return async (req, res, next) => {
        // super_admin always has all permissions
        if (req.userRole === 'super_admin') {
            return next();
        }

        try {
            const [rows] = await pool.execute(`
                SELECT p.permissions_name 
                FROM roles_has_permission rhp
                JOIN permissions p ON rhp.id_permissions = p.id
                JOIN users_has_roles uhr ON rhp.id_roles = uhr.id_roles
                WHERE uhr.id_users = ? AND p.permissions_name = ?
            `, [req.userId, permission]);

            if (rows.length > 0) {
                next();
            } else {
                res.status(403).json({ message: `Access denied. Permission '${permission}' required.` });
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };
};

module.exports = { verifyToken, isAdmin, hasPermission };
