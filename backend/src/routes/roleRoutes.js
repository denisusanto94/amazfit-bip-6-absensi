const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, isAdmin, roleController.getRoles);
router.post('/', verifyToken, isAdmin, roleController.createRole);
router.delete('/:id', verifyToken, isAdmin, roleController.deleteRole);
router.put('/:id', verifyToken, isAdmin, roleController.updateRole);

// RBAC mapping
router.get('/:id/permissions', verifyToken, isAdmin, roleController.getRolePermissions);
router.post('/assign', verifyToken, isAdmin, roleController.assignPermission);
router.post('/revoke', verifyToken, isAdmin, roleController.revokePermission);

module.exports = router;
