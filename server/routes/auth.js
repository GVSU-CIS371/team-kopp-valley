const express = require('express');
const router = express.Router();
const { register, getMe } = require('../controllers/authController');
const verifyToken = require("../middleware/auth");

router.post('/register', register);
router.get('/me', verifyToken, getMe)

module.exports = router;