const express = require('express');
const router = express.Router();

const AuthController = require('../controller/Authcontroller');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.put('/forgot_password', AuthController.forgotPassword);

module.exports = router;