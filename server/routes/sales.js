const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');
const { openDay, getSession, createSale, getTodaySales, getWeeklySales, closeDay, reopenDay, getDayStatus } = require('../controllers/salesController');

router.use(auth);

router.post('/open', openDay);
router.get('/session', getSession);
router.post('/', createSale);
router.get('/today', getTodaySales);
router.get('/status', getDayStatus);
router.get('/week', isAdmin, getWeeklySales);
router.post('/close', closeDay);
router.post('/reopen', reopenDay);

module.exports = router;
