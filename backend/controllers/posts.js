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


