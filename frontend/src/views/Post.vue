<template>
  <div class="Post">

    <header class="header">
        <div id="logo">
            <img alt="Vue logo" src="../assets/logonoir.png">
        </div>
        <nav id="nav">
            <div id="add">
                <router-link to="/addpost"><i class="fas fa-plus-circle"></i><br>Publier</router-link>
            </div> 
            <ul>
              <li class="iconuser"><i class="fas fa-user-alt"></i></li>
              <li class = "profil"><router-link :to="'/user/'+id">Profil</router-link></li>
              <li class = "deconnexion" @click = "disconnection">Déconnexion </li>
            </ul>
        </nav>
    </header>

    <section>

        <!--Div contenant le post -->
        <div id="postDiv"></div>

        <!--Div permettant de créer un commentaire -->
        <div id="commentDiv">
            <label for="comment">Ajouter un commentaire :</label>
            <textarea type="text" id="comment" name="comment" minlength="1" maxlength="499"></textarea>
            <button type="button" class="button button__add" @click="postComment">Ajouter</button>
        </div>

        <!--Div contenant l'ensemble des commentaires -->
        <div class="allComments"></div>

        <!--Boutons en bas des commentaires-->
        <router-link to="/posts"> <button class = "button button__back"> <i class="fas fa-undo"></i> Retourner au fil d'actualité </button> </router-link>
        <!--Modification-->
        <button class = "button button__modify" v-if= "prenom===postPseudo||prenom==='SuperAdmin'" @click= "modifyPost"> Modifier le post </button>
        <button class ="button button__delete" v-if= "prenom===postPseudo||prenom==='SuperAdmin'" @click= "deletePost" ><i class="fas fa-trash"></i> Supprimer le post </button>
        <div class="loader" v-show="waiting===true"></div>
        <p id="erreur" v-show="success===false"> Echec de la requête : {{message}} </p>

    </section>

  </div>

</template>

<script>
export default {
    data: function() {
        return {
            success: true, //affichage d'un message d'erreur si passe à false
            waiting: false, 
            message :"", //message d'erreur
            id: "", //id de l'utilisateur connecté
            token: "", //token de connection
            prenom:"", //prénom de l'utilisateur connecté
            postPseudo: "", //On récupère le pseudo de celui qui a créé le post
            numberOfComments: 0, //Nombre total de commentaires
            userLike:false, //Vrai si l'utilisateur en cours a liké le post
            userDislike:false //Vrai si l'utilisateur en cours a disliké le post
        }
    },
    //Chargement automatique dès que le js est monté
    mounted() {
        const userInfo = JSON.parse(localStorage.getItem('userInfo')); //on récupère les infos de connection
        if (userInfo) { //On vérifie si l'utilisateur s'est connecté
            this.id = userInfo.id;
            this.prenom = userInfo.prenom;
            this.token = userInfo.token;
            this.getPostDetails(); //Appel de la fonction qui charge les détails du post
        }
        else this.$router.push({ name: 'login' }); //sinon on le renvoie vers la page login
    },
    methods: {
        getPostDetails(){
            
            //On commence par réinitialiser les composants
            document.getElementById("postDiv").innerHTML='';
            this.userLike=false;
            this.userDislike=false;
            //Requête GET à l'API
            const optionsGetPost = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`
                }
            };
            const postId = window.location.href.substr((window.location.href.lastIndexOf("/") + 1));
            this.waiting = true;
            fetch(`http://localhost:3000/api/posts/${postId}`, optionsGetPost)
            .then (res => {
                if (res.status == 200) {
                res.json ()
                    .then (json => {
                        this.waiting=false;
                        const divToFill = document.getElementById('postDiv');
                        //Titre du post
                        let newH2 = document.createElement("h2");
                        newH2.textContent = json.title;
                        divToFill.appendChild(newH2);
                        //Description s'il y en a
                        if (json.description) {
                            let newP = document.createElement("p");
                            newP.textContent = json.description;
                            newP.setAttribute("id","postDescription");
                            divToFill.appendChild(newP);
                        }
                        //Affichage du média s'il y en a
                        if (json.image_url) {
                            const publicationContainer = document.createElement("div");
                            divToFill.appendChild(publicationContainer);
                            const mediaExtension = json.image_url.substr((json.image_url.lastIndexOf('.') + 1));
                            
                            //Cas de la vidéo
                            if (mediaExtension === 'mp4') {
                                const newVideo = document.createElement("video");
                                newVideo.src = json.image_url;
                                newVideo.controls = true;
                                newVideo.textContent = json.image_url;
                                publicationContainer.appendChild(newVideo);
                            }
                            else { //Cas de l'image
                                const newImage = document.createElement("img");
                                newImage.src = json.image_url;
                                newImage.alt = json.image_url;
                                publicationContainer.appendChild(newImage);
                            }
                        }
                        //S'il y a un lien
                        if (json.link) {
                            let newP = document.createElement("p");
                            let newA = document.createElement("a");
                            newA.href = json.link;
                            newA.textContent = json.link;
                            newP.appendChild(newA);
                            divToFill.appendChild(newP);
                        }
                        //Prenom et photo de profil
                        const picContainer = document.createElement("p");
                        console.log(picContainer);
                        divToFill.appendChild(picContainer);
                        picContainer.textContent = `Par ${json.prenom} `;
                        this.postPseudo=json.pseudo;
                        const newImage = document.createElement("img");
                        newImage.src = json.imageurl;
                        newImage.alt = json.imageurl;
                        newImage.width = 50;
                        newImage.height = 50;
                        divToFill.appendChild(newImage);
                        
                        //Paragraphe indiquant de quand date le post
                        const publishedOn = document.createElement("p");
                        /*Le paragraphe date reçue de la base indique "post publié il y a hhh:mm:ss " */
                        
                        const hoursSincePost = parseInt(json.date.substring(0,json.date.indexOf(':')));
                        switch (true) {
                            case hoursSincePost == 0:
                                publishedOn.textContent = "Publié il y a moins d'une heure";
                                break;
                            case hoursSincePost == 1:
                                publishedOn.textContent = `Publié il y a 1 heure`;
                                break;
                            case hoursSincePost<=23 && hoursSincePost>1:
                                publishedOn.textContent = `Publié il y a ${hoursSincePost} heures`;
                                break;
                            case hoursSincePost<=47 && hoursSincePost>23:
                                publishedOn.textContent = `Publié il y a 1 jour`;
                                break;
                            case hoursSincePost<=167 && hoursSincePost>47:
                                publishedOn.textContent = `Publié il y a ${Math.floor(hoursSincePost/24)} jours`;
                                break;
                            case hoursSincePost>167:
                                publishedOn.textContent = `Publié il y a plus d'1 semaine`;
                                break;
                        }
                        divToFill.appendChild(publishedOn);
                        //Ajout des likes et dislikes, ainsi que du texte indiquant le nombre total de commentaires
                        const likesAndComments = document.createElement("div");
                        likesAndComments.setAttribute("id", "likesAndComments");
                        const likesDiv = document.createElement("div");
                        likesAndComments.appendChild(likesDiv);
                    /*Partie likes*/
                        const likeDiv = document.createElement("div");
                        likeDiv.setAttribute("class", "like");
                        likeDiv.innerHTML='<i class="far fa-thumbs-up fa-lg"></i>'; //Utilisation fontawesome
                        //Cas où l'utilisateur connecté a déjà liké le post => like affiché en vert
                        if (json.usersLike.indexOf(this.pseudo) != -1)
                         {likeDiv.style.color = "green";
                         this.userLike=true;}
                        //Affiche le nombre total de likes du post
                        if (json.usersLike.length>0) {
                            likeDiv.innerHTML+= " "+ json.usersLike.length;
                        }
                        //Appel à la fonction qui poste un nouveau like
                        likeDiv.addEventListener("click", this.postLike);
                        likesDiv.appendChild(likeDiv);
                    /*Fin de la partie likes*/
                    /*Partie dislikes*/
                        const dislikeDiv = document.createElement("div");
                        dislikeDiv.setAttribute("class", "like");
                        dislikeDiv.innerHTML='<i class="far fa-thumbs-down fa-lg"></i>'; //Utilisation fontawesome
                        //Cas où l'utilisateur connecté a déjà disliké le post => dislike affiché en rouge
                        if (json.usersDislike.indexOf(this.pseudo) != -1)
                         {dislikeDiv.style.color = "red";
                            this.userDislike=true;}
                        //Affiche le nombre total de dislikes du post
                        if (json.usersDislike.length>0) {
                            dislikeDiv.innerHTML+= " "+ json.usersDislike.length;
                        }
                        //Appel à la fonction qui poste un nouveau dislike
                        dislikeDiv.addEventListener("click", this.postDislike);
                        likesDiv.appendChild(dislikeDiv);
                    /*Fin de la partie dislikes*/
                    /*Partie nombre de commentaires*/
                        const numberComments = document.createElement("p");
                        numberComments.setAttribute("id", "numberOfComments");
                    /*Fin de la partie nombre de commentaires*/
                        //Appel de la fonction qui récupère tous les commentaires du post
                        this.getAllComments();
                        
                        likesAndComments.appendChild(numberComments);
                        divToFill.appendChild(likesAndComments);
                    })
                }
                //Sinon on est renvoyé vers la page login
                else {res.json ().then (() => {this.$router.push({ name: 'login' });})}
            })
            .catch (() => {
                this.waiting=false;
                this.success= false;
                this.message = "Erreur server !";
            })
        },
        //Fonction de post des likes
        postLike(){
            const postId = window.location.href.substr((window.location.href.lastIndexOf("/") + 1));
            this.waiting=true;
            //Dé-liker => on poste la valeur 1 pour l'API
            if (this.userLike == true) {
                const optionsLike = {
                    method: 'POST',
                    body: JSON.stringify({"userId": this.id, "like": 1}),
                    headers: {'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`}
                };
                console.log(optionsLike);
                fetch(`http://localhost:3000/api/posts/${postId}/like`, optionsLike)
                    .then (res => {
                        if (res.status == 201) {res.json ()
                            .then (() => {
                                this.success=true;
                                this.waiting=false;
                                alert("Like pris en compte");
                                //Fin de la fonction, on refait la requête GET à l'API pour réinitialiser les valeurs
                                this.getPostDetails();  
                            })
                        }
                        else {res.json ()
                            .then (json => {
                                this.waiting=false;
                                this.success = false;
                                this.message = json.error;
                                })
                            }
                    })
                    .catch (() => {
                        this.waiting=false;
                        this.success= false;
                        this.message = "Désolé, le serveur ne répond pas ! Veuillez réessayer ultérieurement";
                    });
            }
            //Si le post n'a pas encore été liké par nous-mêmes, on poste la valeur 2 à l'API
            else {
                const optionsLike = {
                    method: 'POST',
                    body: JSON.stringify({"userId": this.id, "like": 2}),
                    headers: {'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`}
                };
                fetch(`http://localhost:3000/api/posts/${postId}/like`, optionsLike)
                    .then (res => {
                        if (res.status == 201) {res.json ()
                            .then (() => {
                                this.success=true;
                                this.waiting=false;
                                alert("Like pris en compte");
                                this.getPostDetails();
                            })
                        }
                        else {res.json ()
                            .then (json => {
                                this.waiting=false;
                                this.success = false;
                                this.message = json.error;
                                })
                            }
                    })
                    .catch (() => {
                        this.waiting=false;
                        this.success= false;
                        this.message = "Erreur server !";
                    });
            }
        },
        //Fonction de post des dislikes
        postDislike() {
            const postId = window.location.href.substr((window.location.href.lastIndexOf("/") + 1));
            this.waiting=true;
            //Si le post est déjà disliké par nous, ça veut dire qu'on veut le dé-disliker => on poste la valeur -1 pour l'API
            if (this.userDislike == true) {
                const optionsDislike = {
                    method: 'POST',
                    body: JSON.stringify({"userId": this.id, "like": -1}),
                    headers: {'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`}
                };
                fetch(`http://localhost:3000/api/posts/${postId}/like`, optionsDislike)
                    .then (res => {
                        if (res.status == 201) {res.json ()
                            .then (() => {
                                this.success=true;
                                this.waiting=false;
                                alert("Dislike pris en compte");
                                this.getPostDetails();
                            })
                        }
                        else {res.json ()
                            .then (json => {
                                this.waiting=false;
                                this.success = false;
                                this.message = json.error;
                                })
                            }
                    })
                    .catch (() => {
                        this.waiting=false;
                        this.success= false;
                        this.message = "Erreur serveur !";
                    });
            }
            //Si le post n'a pas encore été disliké par nous-mêmes, on poste la valeur -2 à l'API
            else {
                const optionsDislike = {
                    method: 'POST',
                    body: JSON.stringify({"userId": this.id, "like": -2}),
                    headers: {'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`}
                };
                fetch(`http://localhost:3000/api/posts/${postId}/like`, optionsDislike)
                    .then (res => {
                        if (res.status == 201) {res.json ()
                            .then (() => {
                                this.success=true;
                                this.waiting=false;
                                alert("Dislike pris en compte");
                                this.getPostDetails();
                            })
                        }
                        else {res.json ()
                            .then (json => {
                                this.waiting=false;
                                this.success = false;
                                this.message = json.error;
                                })
                            }
                    })
                    .catch (() => {
                        this.waiting=false;
                        this.success= false;
                        this.message = "Erreur serveur !";
                    });
            }
        },
        //Effacement des données de connection et redirection vers la page login
        disconnection() {
            localStorage.clear();
            this.$router.push({ name: 'login' });
        },  
        //Cas du click sur bouton "modifier le post" => renvoi vers la page modifypost
        modifyPost() {
            const postId = window.location.href.substr((window.location.href.lastIndexOf("/") + 1));
            this.$router.push({ path: `/modifypost/${postId}` })
        },
        //Fonction pour obtenir l'ensemble des commentaires
        getAllComments() {
            //Réinitialisation du bloc commentaires
            document.getElementsByClassName("allComments")[0].innerHTML='';
            //Appel à l'API
            const optionsGetComments = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`
                }
            };
            const postId = window.location.href.substr((window.location.href.lastIndexOf("/") + 1));
            this.waiting = true;
            fetch(`http://localhost:3000/api/posts/${postId}/comment`, optionsGetComments)
                .then (res => {
                    if (res.status == 200) {res.json ()
                        .then (json => {
                            this.waiting=false;
                            this.numberOfComments = json.length;
                            const divToFill = document.getElementsByClassName('allComments')[0];
                            //Affichage de l'info "nomnbre total de commentaires en bas du post"
                            if (this.numberOfComments > 1) {document.getElementById("numberOfComments").textContent= this.numberOfComments + " commentaires";}
                            else if (this.numberOfComments == 1) {document.getElementById("numberOfComments").textContent= "1 commentaire";}
                            else {document.getElementById("numberOfComments").textContent= "Pas encore de commentaire, commentez à votre tour !";}
                            
                            //S'il y a des commentaires
                            if (json.length>0) {
                                //Paragraphe d'intro
                                const introP = document.createElement("p");
                                introP.setAttribute("id","commentsIntro");
                                introP.textContent= "Tous les commentaires :";
                                divToFill.appendChild(introP);
                                
                                //Boucle pour afficher tous les commentaires
                                for (let i = 0; i < json.length; i++) {
                                    const newP = document.createElement("p");
                                    const newSpan = document.createElement("span");
                                    //Affiche le prenom de celui qui a fait le commentaire avec sa photo de profil et le commentaire
                                    newSpan.innerHTML = `${json[i].prenom} <img src='${json[i].imageurl}' width='20' height='20' alt='photo de profil de ${json[i].prenom}'> : ${json[i].comment}`;
                                    newP.appendChild(newSpan);
                                    divToFill.appendChild(newP);
                                    //Seul l'admin ou celui qui a créé le commentaire a accès au bouton de suppression du commentaire
                                    if (this.prenom == json[i].pseudo || this.pseudo == 'SuperAdmin') {
                                        const newButton = document.createElement("button");
                                        newButton.setAttribute("type","button");
                                        newButton.setAttribute("class", "deleteComment");
                                        newButton.innerHTML = '<i class="fas fa-trash fa-lg"></i>';
                                        newP.appendChild(newButton);
                                        //Appel à l'API en cas de suppression du commentaire
                                        newButton.addEventListener("click", () => {
                                            const optionsDeleteComment = {
                                                method: 'DELETE',
                                                headers: {
                                                    'Authorization': `Bearer ${this.token}`
                                                }
                                            };
                                            this.waiting = true;
                                            fetch(`http://localhost:3000/api/posts/${json[i].id}/comment`, optionsDeleteComment)
                                                .then (res => {
                                                    if (res.status == 200) {res.json ()
                                                        .then (() => {
                                                            this.waiting=false;
                                                            alert("Le commentaire a bien été supprimé");
                                                            //On supprime le paragraphe du DOM
                                                            newP.remove();
                                                            //On met aussi à jour le nombre total de commentaires
                                                            this.numberOfComments--;
                                                            this.getAllComments();
                                                        })
                                                    }
                                                    else {res.json ()
                                                        .then (json => {
                                                            this.waiting=false;
                                                            this.success = false;
                                                            this.message = json.error;
                                                        })
                                                    }
                                                })
                                                .catch (() => {
                                                    this.waiting=false;
                                                    this.success= false;
                                                    this.message = "Désolé, le serveur ne répond pas ! Veuillez réessayer ultérieurement";
                                                })
                                        }) //Fin de l'appel DELETE à l'API (sur les commentaires)
                                    } //Fin du "if" sur la présence du bouton de suppression du commentaire
                                } //Fin de la boucle for
                            } //Fin du "if" sur l'existence des commentaires ou non
                        }) //Fin des actions en cas de réponse OK de l'API GET sur les commentaires
                    }
                    //Cas où l'API renvoie un code d'erreur
                    else {res.json ()
                        .then (json => {
                            this.waiting=false;
                            this.success = false;
                            this.message = json.error;
                        })
                    }
                })
                .catch (() => {
                    this.waiting=false;
                    this.success= false;
                    this.message = "Erreur serveur !";
                })
        },
        //Fonction appelée en cas de suppression du post
        deletePost() {
            //Demande de confirmation avant de supprimer
            let confirmation = confirm("Etes-vous certain de vouloir supprimer ce post ?");
            if (confirmation == true) {
                const optionsDeletePost = {
                    method: 'DELETE',
                    headers: {
                    'Authorization': `Bearer ${this.token}`
                    }
                };
                const currentUrl = window.location.href;
                const postId = currentUrl.substr((currentUrl.lastIndexOf("/") + 1));
                this.waiting = true;
                fetch(`http://localhost:3000/api/posts/${postId}`, optionsDeletePost)
                    .then (res => {
                        if (res.status == 200) {res.json ()
                            .then (() => {
                                this.waiting=false;
                                alert("Le post a bien été supprimé");
                                //Dans ce cas on retourne à la page posts
                                this.$router.push({ name: 'posts' });
                            })
                        }
                        else {res.json ()
                            .then (json => {
                                this.waiting=false;
                                this.success = false;
                                this.message = json.error;
                            })
                        }
                    })
                    .catch (() => {
                        this.waiting=false;
                        this.success= false;
                        this.message = "Erreur serveur ! ";
                    })
            }
        },
        //Fonction pour poster un nouveau commentaire
        postComment() {
            const postId = window.location.href.substr((window.location.href.lastIndexOf("/") + 1));
            //On s'assure d'abord que le commentaire est valide
            if (document.getElementById("comment").checkValidity()) {
                this.waiting = true;
                //On le poste à l'API avec le userId
                const post = {"userId": this.id, "comment": document.getElementById("comment").value};
                const optionsPostComment = {
                    method: 'post',
                    body:JSON.stringify(post),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                        }
                };
                fetch(`http://localhost:3000/api/posts/${postId}/comment`, optionsPostComment)
                    .then (res => {
                        if (res.status == 201) {res.json ()
                            .then (() => {
                                this.success=true;
                                this.waiting=false;
                                alert("Commentaire publié");
                                //Rafraîchir l'affichage global des commentaires
                                this.getAllComments();
                            })
                        }
                        else {res.json ()
                            .then (json => {
                                this.waiting=false;
                                this.success = false;
                                this.message = json.error;
                                })
                            }
                    })
                    .catch (() => {
                        this.waiting=false;
                        this.success= false;
                        this.message = "Erreur serveur";
                    });
            }          
        } //Fin de la fonction
    } //Fin des méthodes
}
</script>

<style lang="scss">
section {
    width:60%;
    margin:auto;
}
@media screen and (max-width: 600px) {
  section {width:90%;}
}
#postDiv {
    text-align: center;
    box-shadow: 5px 5px 10px grey;
    margin:30px auto;
    background-color: #d4d3d3;
    padding:5px;
}
#postDescription {
    border: 1px solid black;
    background: white;
    height: auto;
}
#commentDiv {
    margin:20px auto;
    
    & > textarea {
        margin:5px;
        width:90%;
    }
}
#commentsIntro {
    text-align: center;
}
.allComments > p {
    font-size:18px;
    margin:15px;
    word-wrap: break-word;
    
}
.allComments > p:nth-child(2n) {
    text-align: left;
    box-shadow: 0 0 16px;
    padding: 10px;
}
.allComments > p:nth-child(2n+1) {
    text-align: right;
}
p span {
    background-color: white;
    margin-right: 10px;
    font-size: 1.2em;
}
.deleteComment {
    background-color: white;
    cursor: pointer;
    border-radius: 8px;
    padding: 5px;
}
#likesAndComments {
    display:flex;
    justify-content: space-between;
}
.like {
    margin:8px;
    &:hover {
    cursor: pointer;
    }
}
.button {
    color: white;
    cursor: pointer;
    border-radius: 8px;
    margin: 15px 5px;
    padding: 10px;
    font-weight:bold;
    font-size: 16px;
    &__modify {
        background-color: black;
    }
    &__delete {
        background-color: black;
    }
    &__add {
        background-color: black;
    }
    &__back {
        color:black;
        background-color: white;
    }
    & > a {
        text-decoration: none;
    }
}
img, video {
max-width:100%;
max-height:300px;
}
</style>