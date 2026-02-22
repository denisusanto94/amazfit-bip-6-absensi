const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, holidayController.getHolidays);
router.post('/', verifyToken, isAdmin, holidayController.createHoliday);
router.put('/:id', verifyToken, isAdmin, holidayController.updateHoliday);
router.delete('/:id', verifyToken, isAdmin, holidayController.deleteHoliday);

module.exports = router;
