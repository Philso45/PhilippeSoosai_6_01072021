const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!\?@\.#\$%\^&\*])(?=.{8,})");
// Mot de passe fort avec au moins 8 caractères dont au moins 1 minuscule, 1 majuscule, 1 chiffre, et 1 caractère spécial

//Limiter la création de trop de comptes et trop de tentatives de connection

// Récupère les infos du formulaire, enregistre l'url de l'avatar, vérifie que l'utilisateur n'existe pas déjà, teste la sécurité du mot de passe
exports.signup = (req, res, next) => {
    const userObject = JSON.parse(req.body.user);
    const imageUrl = `${req.protocol}://${req.get('host')}/medias/${req.file.filename}`;
    if (passwordRegex.test(userObject.password)) { //Si la sécurité du mot de passe correspond au critère demandé
      bcrypt.hash(userObject.password, 10) //Algorythme de hashage du mot de passe
      .then((hash) => {
        //Le hash est sauvegardé dans la base et non le mot de passe en clair
        let signupQuery = "INSERT INTO users VALUES (NULL,'" + userObject.email + "','" + hash + "','" + userObject.pseudo + "','"+imageUrl+"')";
        db.query(signupQuery, function (err, result) {
          if (!err) {
            res.status(201).json({ message: 'Utilisateur créé !' })
          }
          else if (err.code==='ER_DUP_ENTRY') {
            res.status(401).json({ error: "L'utilisateur ou le pseudo existe déjà !" })
          }
          else throw err;     
          });
      })
      .catch(error => res.status(500).json({ error }));
    }
    else {
      res.status(400).json({error: "Le mot de passe n'est pas assez sécurisé"});
    }
}

//Vérifie que l'utilisateur existe et que le mdp est correct puis renvoie un token de connection avec l'id et le pseudo
exports.login = (req, res, next) => {
  let loginQuery = "SELECT * FROM users where email = '" + req.body.email + "'";
  db.query(loginQuery, function (err, result) {
    if (err) throw err;
    else {
      if(result.length > 0) {
        bcrypt.compare(req.body.password, result[0].password)
        .then((valid) => {
          if (!valid) {return res.status(401).json({ error: 'Mot de passe incorrect !' });}
          else {res.status(200).json({ //Retourne le User Id, le pseudo et le Token
              id: result[0].id,
              pseudo: result[0].pseudo,
              token: jwt.sign({ userId: result[0].id },process.env.TOKEN,{ expiresIn: '24h' })
          });}
        })
        .catch(error => res.status(500).json({ error }));
      }
      else {res.status(401).json({ error: 'Utilisateur non trouvé !' });}
    }
});
}