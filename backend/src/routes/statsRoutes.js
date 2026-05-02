const express = require('express');
const { getOrgStats } = require('../controllers/statsController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/org', adminOnly, getOrgStats);

module.exports = router;
