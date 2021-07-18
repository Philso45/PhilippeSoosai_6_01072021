const express = require('express');
const router = express.Router();

//Import du middleware multer pour la gestion des images
const multer = require('../middleware/multer-config');

//Import du middleware authSupUser pour sécuriser les routes de modification ou suppression user

const userCtrl = require('../controllers/user');

router.post('/signup', multer, userCtrl.signup);
router.post('/login', userCtrl.login);


module.exports = router;