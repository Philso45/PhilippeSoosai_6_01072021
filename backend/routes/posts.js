const express = require('express');
const router = express.Router();

//Import du middleware auth pour sécuriser les routes
const auth = require('../middleware/auth');

//Controlleur des routes définies plus bas
const postsCtrl = require('../controllers/posts');


router.get('/', auth, postsCtrl.getAllPosts);

module.exports = router;