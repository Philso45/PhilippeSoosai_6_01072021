const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const database = require('../config/database');
const fs = require('fs');
const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!\?@\.#\$%\^&\*])(?=.{8,})");
// Mot de passe fort avec au moins 8 caractères dont au moins 1 minuscule, 1 majuscule, 1 chiffre, et 1 caractère spécial

const { json } = require('body-parser');

// Récupère les infos du formulaire, enregistre l'url de la photo de profil, vérifie que l'utilisateur n'existe pas déjà, teste la sécurité du mot de passe
exports.signup = (req, res, next) => {
    const userObject = JSON.parse(req.body.user);
    const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    if (passwordRegex.test(userObject.password)) { //Si la sécurité du mot de passe correspond au critère demandé
      bcrypt.hash(userObject.password, 10) //Algorythme de hashage du mot de passe
      .then((hash) => {
        //Le hash est sauvegardé dans la base et non le mot de passe en clair
        let signupQuery = "INSERT INTO users VALUES (NULL,'" + userObject.prenom + "','" + userObject.nom + "','" + userObject.email + "','" + hash + "','"+imageUrl+"')";
        database.query(signupQuery, function (err, result) {
          if (!err) {
            res.status(201).json({ message: 'Utilisateur créé !' })
          }
          else if (err.code==='ER_DUP_ENTRY') {
            res.status(401).json({ error: "L'utilisateur ou le prénom/nom existe déjà !" })
          }
          else throw err;     
          });
      })
      .catch(error => res.status(500).json({ error }));
    }
    else {
      res.status(400).json({error: "Le mot de passe doit contenir au moins 8 caractères dont au moins 1 minuscule, 1 majuscule, 1 chiffre, et 1 caractère spécial"});
    }
}

//Vérifie que l'utilisateur existe et que le mdp est correct puis renvoie un token de connection avec l'id et le pseudo
exports.login = (req, res, next) => {
  console.log("aaaaa");
  let loginbase = "SELECT * FROM users where email = '" + req.body.email + "'";

  database.query(loginbase, function (err, result) {
    console.log(result[0]);
    if (err) throw err;
    else {
      if(result.length > 0) {
        bcrypt.compare(req.body.password, result[0].password)
        .then((valid) => {
          console.log(process.env.JWT_TOKEN);
          if (!valid) {return res.status(401).json({ error: 'Mot de passe incorrect !' });}
          else {res.status(200).json({ //Retourne le User Id, le prenom et le Token
              id: result[0].id,
              pseudo: result[0].prenom,
              token: jwt.sign({ userId: result[0].id },process.env.JWT_TOKEN,{ expiresIn: '24h' })
          });}
        })
        .catch(error => res.status(500).json({ error }));
      }
      else {res.status(401).json({ error: 'Utilisateur non trouvé !' });}
    }
  });
}

//Permet de récupérer les infos de l'utilisateur (photo de profil et email)
exports.getUserInfo = (req, res, next) => {
  let getUserInfoQuery = 'SELECT email, imageurl FROM users where id = '+ database.escape(req.params.id);
  database.query(getUserInfoQuery, function (err, result) {
    if (err) throw err;
    else {
      if(result.length > 0) {
        res.status(200).json({
            email: result[0].email,
            imageurl: result[0].imageurl,
          })
        }
      else {res.status(401).json({ error: "L'utilisateur n'a pas été trouvé !" });}
    }
  })
}

//Permet de modifier la photo de profil d'un user
exports.modifyUser = (req, res, next) => {
  const imageurl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
  const infoAvatarQuery = "SELECT imageurl FROM users where id = "+ req.params.id;
  database.query(infoAvatarQuery, function (err, result) {
    if (err) {res.status(400).json({ error : err.code });}
    else {
      const oldimageurl = result[0].imageurl.split('/images/')[1];
      const modifyAvatarQuery = "UPDATE users SET imageurl = '"+imageurl+"' WHERE id = "+ req.params.id;
      database.query(modifyAvatarQuery, function (err, result) {
        if (err) {res.status(400).json({ error : err.code });}
        else {
          fs.unlink(`images/${oldimageurl}`, () => {res.status(200).json({ message: 'Photo de profil modifié !'});})
        }
      })
    }
  })
}

//Permet d'effacer un user de la base
exports.deleteUser = (req, res, next) => {
  const deleteAvatarQuery = "SELECT imageurl FROM users where id = "+ req.params.id;
  database.query(deleteAvatarQuery, function (err, result) {
    if (err) {res.status(400).json({ error : err.code });}
    else {
      const filename = result[0].imageurl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        let deleteQuery = "DELETE FROM users where id = " + req.params.id;
          database.query(deleteQuery, function (err, result) {
            if (err) {res.status(400).json({ error : err.code });}
            else {res.status(200).json({ message: 'Utilisateur supprimé !'});}
        })
      })
    }
  })
}