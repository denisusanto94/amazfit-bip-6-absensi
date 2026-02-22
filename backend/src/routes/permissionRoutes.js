const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, isAdmin, permissionController.getPermissions);
router.post('/', verifyToken, isAdmin, permissionController.createPermission);
router.delete('/:id', verifyToken, isAdmin, permissionController.deletePermission);
router.put('/:id', verifyToken, isAdmin, permissionController.updatePermission);

module.exports = router;
