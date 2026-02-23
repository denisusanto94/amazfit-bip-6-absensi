const express = require('express');
const router = express.Router();
const controller = require('../controllers/attendanceTransumController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, controller.getAll);
router.get('/options', verifyToken, controller.getOptions);
router.get('/:id', verifyToken, controller.getById);
router.post('/', verifyToken, controller.create);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, isAdmin, controller.remove);

module.exports = router;
