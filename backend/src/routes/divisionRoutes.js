const express = require('express');
const router = express.Router();
const divisionController = require('../controllers/divisionController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, divisionController.getDivisions);
router.post('/', verifyToken, isAdmin, divisionController.createDivision);
router.put('/:id', verifyToken, isAdmin, divisionController.updateDivision);
router.delete('/:id', verifyToken, isAdmin, divisionController.deleteDivision);

module.exports = router;
