const pool = require('../config/db');

exports.getRoles = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT r.*, 
                   IF(r.roles_name = 'super_admin', 'ALL PERMISSIONS', GROUP_CONCAT(DISTINCT p.permissions_name SEPARATOR ', ')) as permissions
            FROM roles r
            LEFT JOIN roles_has_permission rhp ON r.id = rhp.id_roles
            LEFT JOIN permissions p ON rhp.id_permissions = p.id
            GROUP BY r.id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createRole = async (req, res) => {
    const { roles_name, permissions, division_id } = req.body;
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [result] = await conn.execute('INSERT INTO roles (roles_name) VALUES (?)', [roles_name]);
        const roleId = result.insertId;

        if (division_id && permissions) {
            const permIds = Array.isArray(permissions) ? permissions : [permissions];
            for (const permId of permIds) {
                await conn.execute(
                    'INSERT INTO roles_has_permission (id_roles, divisions_id, id_permissions) VALUES (?, ?, ?)',
                    [roleId, division_id, permId]
                );
            }
        }

        await conn.commit();
        res.status(201).json({ message: 'Role created' });
    } catch (err) {
        await conn.rollback();
        console.error('Create role error:', err);
        res.status(500).json({ message: err.message });
    } finally {
        conn.release();
    }
};

exports.deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM roles WHERE id = ?', [id]);
        res.json({ message: 'Role deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateRole = async (req, res) => {
    const { id } = req.params;
    const { roles_name, permissions, division_id } = req.body;
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.execute('UPDATE roles SET roles_name = ? WHERE id = ?', [roles_name, id]);

        if (division_id) {
            // Check if it's super_admin, if so skip permission sync as it's hardcoded to ALL
            const [roleRows] = await conn.execute('SELECT roles_name FROM roles WHERE id = ?', [id]);
            if (roleRows.length > 0 && roleRows[0].roles_name === 'super_admin') {
                // Do nothing for super_admin permissions
            } else {
                // Delete ALL existing permissions for this role so we can sync new ones
                await conn.execute('DELETE FROM roles_has_permission WHERE id_roles = ?', [id]);

                if (permissions) {
                    const permIds = Array.isArray(permissions) ? permissions : [permissions];
                    for (const permId of permIds) {
                        await conn.execute(
                            'INSERT INTO roles_has_permission (id_roles, divisions_id, id_permissions) VALUES (?, ?, ?)',
                            [id, division_id, permId]
                        );
                    }
                }
            }
        }

        await conn.commit();
        res.json({ message: 'Role updated' });
    } catch (err) {
        await conn.rollback();
        console.error('Update role error:', err);
        res.status(500).json({ message: err.message });
    } finally {
        conn.release();
    }
};

exports.getRolePermissions = async (req, res) => {
    const { id } = req.params;
    try {
        const [roleRows] = await pool.execute('SELECT roles_name FROM roles WHERE id = ?', [id]);
        if (roleRows.length > 0 && roleRows[0].roles_name === 'super_admin') {
            const [allPerms] = await pool.query('SELECT id as id_permissions, permissions_name FROM permissions');
            // Mock rhp structure for super_admin so frontend shows all checked
            return res.json(allPerms.map(p => ({
                id_roles: parseInt(id),
                divisions_id: 1, // Default to first division
                id_permissions: p.id_permissions,
                permissions_name: p.permissions_name,
                divisions_name: 'ALL'
            })));
        }

        const [rows] = await pool.execute(`
            SELECT rhp.*, p.permissions_name, d.divisions_name
            FROM roles_has_permission rhp
            JOIN permissions p ON rhp.id_permissions = p.id
            JOIN divisions d ON rhp.divisions_id = d.id
            WHERE rhp.id_roles = ?
        `, [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.assignPermission = async (req, res) => {
    const { id_roles, divisions_id, id_permissions } = req.body;
    try {
        await pool.execute(
            'INSERT INTO roles_has_permission (id_roles, divisions_id, id_permissions) VALUES (?, ?, ?)',
            [id_roles, divisions_id, id_permissions]
        );
        res.status(201).json({ message: 'Permission assigned to role' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.revokePermission = async (req, res) => {
    const { id_roles, divisions_id, id_permissions } = req.body;
    try {
        await pool.execute(
            'DELETE FROM roles_has_permission WHERE id_roles = ? AND divisions_id = ? AND id_permissions = ?',
            [id_roles, divisions_id, id_permissions]
        );
        res.json({ message: 'Permission revoked' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
