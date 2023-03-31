'use strict'

const express = require('express');
const UserController = require('../controllers/user');

const router = express.Router();
const md_auth = require('../middlewares/authenticated');

const multipart = require('connect-multiparty');
const md_upload = multipart({uploadDir: './uploads/users'});

// Rutas de prueba
router.get('/probando', UserController.probando);
router.post('/testeando', UserController.testeando);

// Rutas de usuarios
router.post('/register', UserController.save);
router.post('/login', UserController.login);
router.put('/user/update', md_auth.authenticated, UserController.update);
router.post('/upload-avatar', [md_auth.authenticated , md_upload], UserController.uploadAvatar);
router.get('/avatar/:fileName', UserController.avatar);
router.get('/users', UserController.getUsers);
router.get('/user/:userId', UserController.getUser);


module.exports = router;