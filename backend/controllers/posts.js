const fs = require('fs');
const database = require('../config/database');


//Fonction d'envoi au front de tous les posts (requête GET)
exports.getAllPosts = (req, res, next) => {
  const id = parseInt(req.params.id);

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
  const id = parseInt(req.params.id);
  
  //Cas avec média (mix fichier/ objet JSON)
  if (req.file) {
    const postObject = JSON.parse(req.body.post);
    const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    const postQuery = 'INSERT INTO Posts VALUES (NULL,'+database.escape(postObject.userId)+','+database.escape(postObject.title)+','+database.escape(postObject.description)+','+database.escape(imageUrl)+','+database.escape(postObject.url)+', NOW())';
    database.query(postQuery, function (err, result) {
      if (!err) {
        res.status(201).json({ message: 'Post créé !' })
      }
      else {
        res.status(400).json({ error: err.code });
      }     
    });
  }

  //Cas sans média (objet JSON)
  else {
    const postQuery = 'INSERT INTO Posts VALUES (NULL,'+database.escape(req.body.userId)+','+database.escape(req.body.title)+','+database.escape(req.body.description)+',"",'+database.escape(req.body.url)+', NOW())';
    database.query(postQuery, function (err, result) {
      if (!err) {
        res.status(201).json({ message: 'Post créé !' })
      }
      else {
        res.status(400).json({ error: err.code });
      }       
    });
  }
}

//Fonction d'envoi au front du post demandé (requête GET)
exports.getOnePost = (req, res, next) => {
  const id = parseInt(req.params.id);
  let getOneQuery = `SELECT users.prenom, users.imageurl, posts.title, posts.image_url, posts.numero, posts.link, posts.description, TIMEDIFF(NOW(),Posts.date) as date FROM posts INNER JOIN users ON posts.user_id = users.id WHERE posts.numero =${id}`;
  database.query(getOneQuery, function (err, result) {
    if (err) throw err;
    else {
      if(result.length > 0) {
        let postInfo = {
            prenom: result[0].prenom,
            imageurl: result[0].imageurl,
            title: result[0].title,
            description: result[0].description,
            link:result[0].link,
            image_url: result[0].image_url,
            numero: result[0].numero,
            date: result[0].date
          };
        let getLikesQuery = `SELECT users.prenom as usersLike FROM users INNER JOIN likes ON likes.user_id = users.id WHERE likes.post_id =${id}`;
        database.query(getLikesQuery, function (err, result) {
          if (err) throw err;
          else { let usersLike = [];
            for (let i = 0; i < result.length; i++) {
              usersLike.push(result[i].usersLike);
              }
            const usersLikeObject = {usersLike: usersLike};
            postInfo = {...postInfo, ...usersLikeObject};
            
            let getDislikesQuery = `SELECT users.prenom as usersDislike FROM users INNER JOIN dislikes ON dislikes.user_id = users.id WHERE dislikes.post_id =${id}`;
            database.query(getDislikesQuery, function (err, result) {
              if (err) throw err;
              else { let usersDislike = [];
                for (let i = 0; i < result.length; i++) {
                  usersDislike.push(result[i].usersDislike);
                  }
                const usersDislikeObject = {
                  usersDislike: usersDislike
                };
                postInfo = {
                  ...postInfo, ...usersDislikeObject
                };
                res.status(200).json(postInfo);
              }
            })
          }
        })
      }

      else {
        res.status(401).json({ error: 'Pas de post trouvé !' });
      }
    }
  })
}

//Fonction d'envoi au front de tous les commentaires associés au post (requête GET)
exports.getPostComments = (req, res, next) => {
  const id = parseInt(req.params.id);
  let getCommentQuery = `SELECT users.prenom, users.imageurl, comments.numero, comments.comment FROM comments INNER JOIN users ON comments.user_id = users.id WHERE comments.post_id =${id} ORDER BY comments.date DESC`;
  database.query(getCommentQuery, function (err, result) {
    if (err) throw err;
    else {
      if(result.length > 0) {
        const Comments = [];
        for (let i = 0; i < result.length; i++) {
          Comments.push({
            id: result[i].numero,
            imageurl: result[i].imageurl,
            prenom: result[i].prenom,
            comment: result[i].comment
          })
        }
        res.status(200).json(Comments);
      }
      else {
        res.status(200).json([]);
      }
    }
  })
}

//Fonction de suppression du post (requête DELETE)
exports.deletePost = (req, res, next) => {
  const id = parseInt(req.params.id);
  let deletePostQuery = "DELETE FROM posts where numero = " + id;
  database.query(deletePostQuery, function (err, result) {
    if (err) res.status(400).json({error: err.code});
    else res.status(200).json({message: 'Post supprimé !'});
  })
}

//Fonction de suppression d'un commentaire (requête DELETE)
exports.deleteComment = (req, res, next) => {
  const id = parseInt(req.params.id);
  let deleteCommentQuery = "DELETE FROM comments where numero = " + id;
  database.query(deleteCommentQuery, function (err, result) {
    if (err) res.status(400).json({error: err.code});
    else res.status(200).json({message: 'Commentaire supprimé !'});
  })
}


//Fonction de modification de l'objet post (requête PUT)
exports.modifyPost = (req, res, next) => {
  const id = parseInt(req.params.id);

  //Cas avec média
  if (req.file) {
    const postObject = JSON.parse(req.body.post);
    const infoMediaUrlQuery = "SELECT image_url FROM posts where numero = "+ id;
    const mediaUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    database.query(infoMediaUrlQuery, function (err, result) {
      if (err) {
        res.status(400).json({ error : err.code });
      }
      else {
        //On récupère l'url du média précédent pour le supprimer
        const oldMediaUrl = result[0].image_url.split('/images/')[1];
        const putQuery = `UPDATE Posts SET title = "${postObject.title}", description = "${postObject.description}", image_url = "${mediaUrl}", link = "${postObject.url}" where numero = ${id}`;
        database.query(putQuery, function (err, result) {
          //Suppression de l'ancien média et réponse statut OK
          if (!err) {
            fs.unlink(`images/${oldMediaUrl}`, () => {
              res.status(200).json({ message: 'Post modifié !'});
            })
          }
          //Sinon statut 400 avec code d'erreur
          else res.status(400).json({ error : err.code })     
        });
      }
    })
  }

  // Cas sans média dans la requête PUT
  else {
    const putQuery = `UPDATE Posts SET title = "${req.body.title}", description = "${req.body.description}", image_url = "${req.body.mediaUrl}" , link = "${req.body.url}" where numero = ${id}`;
    
    //Cas où il y avait un média initialement dans le post, mais qu'il a été supprimé
    if (req.body.mediaUrl==false) {
      const infoMediaUrlQuery = "SELECT image_url FROM posts where numero = "+ id;
      database.query(infoMediaUrlQuery, function (err, result) {
        if (err) {
          res.status(400).json({ error : err.code });
        }
        else {
          const oldMediaUrl = result[0].image_url.split('/images/')[1];
          fs.unlink(`images/${oldMediaUrl}`, () => {
            database.query(putQuery, function (err, result) {
              if (!err) {
                res.status(200).json({ message: 'Post modifié !'})
              }
              else res.status(400).json({ error : err.code })     
            });
          })
        }
      })
    }

    //Cas où il n'y avait pas de média dans le post
    else {
      database.query(putQuery, function (err, result) {
        if (!err) {
          res.status(200).json({ message: 'Post modifié !'})
        }
        else res.status(400).json({ error : err.code })     
      });
    }
  }
}



//Fonction d'ajout d'un nouveau commentaire (requête POST)
exports.commentPost = (req, res, next) => {
  const id = parseInt(req.params.id);
  const postCommentQuery = `INSERT INTO comments VALUES (NULL,"${req.body.userId}","${id}","${req.body.comment}", NOW())`;
  database.query(postCommentQuery, function (err, result) {
    if (!err) {
      res.status(201).json({ message: 'Commentaire créé !' })
    }
    else res.status(400).json({ error : err.code })     
  });
}

//Traitement des requetes portant sur les likes (requête POST)
exports.likePost = (req, res, next) => {
const id = parseInt(req.params.id);
  //Premier cas : on like un post
  if (req.body.like==2) {
    //Au cas où il serait disliké précédemment, on l'efface d'abord de la liste des posts dislikés
    const eraseQuery = `delete from dislikes where post_id = ${id} and user_id = ${req.body.userId}`;
    database.query(eraseQuery, function (err, result) {
      if (!err) {
        const likeQuery = `insert into likes values (${id},${req.body.userId})`;
        database.query(likeQuery, function (err, result) {
          if (!err) {
            res.status(201).json({ message: 'Like pris en compte !' })
          }
          else res.status(400).json({ error : err.code })     
        });
      }
      else res.status(400).json({ error : err.code })     
    });
  }

  //Deuxième cas : on "dé-like" un post
  else if (req.body.like==1) {
    const likeQuery = `delete from likes where user_id = ${req.body.userId} and post_id = ${id}`;
    database.query(likeQuery, function (err, result) {
      if (!err) {
        res.status(201).json({ message: 'Dé-Like pris en compte !' })
      }
      else res.status(400).json({ error : err.code })    
    });
  }
  
  //Troisième cas : on "dé-dislike" un post
  else if (req.body.like==-1) {
    const dislikeQuery = `delete from dislikes where user_id = ${req.body.userId} and post_id = ${id}`;
    database.query(dislikeQuery, function (err, result) {
      if (!err) {
        res.status(201).json({ message: 'Dé-Dislike pris en compte !' })
      }
      else res.status(400).json({ error : err.code })    
    });
  }
  
  //Dernier cas : on dislike un post
  else {
    //Au cas où il serait liké précédemment, on l'efface d'abord de la liste des posts likés
    const eraseQuery = `delete from likes where post_id = ${id} and user_id = ${req.body.userId}`;
    database.query(eraseQuery, function (err, result) {
      if (!err) {
        const dislikeQuery = `insert into dislikes values (${id},${req.body.userId})`;;
        database.query(dislikeQuery, function (err, result) {
          if (!err) {
          res.status(201).json({ message: 'Dislike pris en compte !' })
          }
          else res.status(400).json({ error : err.code })     
        });
      } 
      else res.status(400).json({ error : err.code })
    })
  }
}