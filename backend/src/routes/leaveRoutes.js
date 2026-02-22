const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, leaveController.getLeaves);
router.post('/', verifyToken, leaveController.createLeave);
router.put('/:id/status', verifyToken, isAdmin, leaveController.updateLeaveStatus);
router.delete('/:id', verifyToken, isAdmin, leaveController.deleteLeave);

module.exports = router;
