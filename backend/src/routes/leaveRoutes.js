const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { verifyToken, isAdmin, hasAnyPermission } = require('../middlewares/authMiddleware');

const approveLeavePerms = [
    'manage_approve_leaves_staf',
    'manage_approve_leaves_supervisor',
    'manage_approve_leaves_manager',
    'manage_approve_leaves_co_ceo',
    'manage_approve_leaves_ceo',
    'manage_approve_leaves_co_cto',
    'manage_approve_leaves_cto',
    'manage_approve_leaves_owners'
];

router.get('/', verifyToken, leaveController.getLeaves);
router.post('/', verifyToken, leaveController.createLeave);
router.put('/:id/status', verifyToken, hasAnyPermission(approveLeavePerms), leaveController.updateLeaveStatus);
router.delete('/:id', verifyToken, isAdmin, leaveController.deleteLeave);

module.exports = router;
