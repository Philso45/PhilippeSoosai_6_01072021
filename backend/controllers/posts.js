const fs = require('fs');
const database = require('../config/database');


//Fonction d'envoi au front de tous les posts (requête GET)
exports.getAllPosts = (req, res, next) => {
  let getAllQuery = "SELECT users.prenom, users.imageurl, posts.title, posts.image_url, posts.numero, TIMEDIFF(NOW(),posts.date) as date FROM posts INNER JOIN users ON posts.user_id = users.id ORDER BY `date` ASC";
  database.query(getAllQuery, function (err, result) {
    if (err) throw err;
    else {
      if(result.length > 0) {
        const Posts = [];
        for (let i = 0; i < result.length; i++) {
          Posts.push({
            prenom: result[i].prenom,
            imageurl: result[i].imageurl,
            title: result[i].title,
            image_url: result[i].image_url,
            numero: result[i].numero,
            date: result[i].date
          })
        }
        res.status(200).json(Posts);
      }
      else {res.status(200).json([]);}
    }
  })
}

//Fonction d'ajout d'un nouveau post (requête POST)
exports.createPost = (req, res, next) => {
  
  //Cas avec média (mix fichier/ objet JSON)
  if (req.file) {
    const postObject = JSON.parse(req.body.post);
    const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    const postQuery = 'INSERT INTO Posts VALUES (NULL,'+database.escape(postObject.userId)+','+database.escape(postObject.title)+','+database.escape(postObject.description)+','+database.escape(imageUrl)+','+database.escape(postObject.url)+', NOW())';
    database.query(postQuery, function (err, result) {
      if (!err) {res.status(201).json({ message: 'Post créé !' })}
      else {res.status(400).json({ error: err.code });}     
      });
  }

  //Cas sans média (objet JSON pur)
  else {
    const postQuery = `INSERT INTO Posts VALUES (NULL,"${req.body.userId}","${req.body.title}","${req.body.description}","","${req.body.url}", NOW())`;
    database.query(postQuery, function (err, result) {
      if (!err) {res.status(201).json({ message: 'Post créé !' })}
      else {res.status(400).json({ error: err.code });}       
      });
  }
}

