const express = require('express');
const router = express.Router();

//Import du middleware auth pour sécuriser les routes
const auth = require('../middleware/auth');

//Controlleur des routes définies plus bas
const postsCtrl = require('../controllers/posts');

//Import du middleware multer pour la gestion des images et vidéos
const multerVideo = require('../middleware/multer-config-video');


router.get('/', auth, postsCtrl.getAllPosts);
router.post('/', auth, multerVideo , postsCtrl.createPost);

module.exports = router;