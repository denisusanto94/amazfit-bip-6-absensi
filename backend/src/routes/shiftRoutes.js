const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, shiftController.getShifts);
router.post('/', verifyToken, isAdmin, shiftController.createShift);
router.put('/:id', verifyToken, isAdmin, shiftController.updateShift);
router.delete('/:id', verifyToken, isAdmin, shiftController.deleteShift);

module.exports = router;
