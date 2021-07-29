<template>
  <div class="AddPost">
    <header class="header">
      <div id="logo"><img alt="Vue logo" src="../assets/logonoir.png"></div>
      
      <nav id="nav">
        <div id="add">
          <router-link to="/addpost"> <i class="fas fa-plus-circle"></i><br>Publier</router-link>
        </div>
        <ul>
          <li class="iconuser"><i class="fas fa-user-alt"></i></li>
          <li class = "profil"><router-link :to="'/user/'+id">Profil</router-link></li>
          <li class = "deconnexion" @click = "disconnection">Déconnexion </li>
        </ul>
      </nav>
    </header>
    <h1 v-if="prenom">Bonjour {{prenom}}, voici les derniers posts</h1>
    <div id="postsDiv"></div>
    
    <p id="erreur" v-show="success===false"> Echec de la requête : {{message}} </p>
  </div>
</template>

<script>

export default {

  //data actualisées au chargement de la page ainsi qu'au cours de certains événements
  data: function() {
    return {
      success: true, //affichage d'un message d'erreur si passe à false     
      message :"", //message d'erreur
      id: "", //id de l'utilisateur connecté
      token: "", //token de connection
      prenom:"", //prenom de l'utilisateur connecté
      Posts: [] //array contenant l'ensemble des posts après requête à la database
    }
  },

  //Chargement automatique les infos dès que le js est monté
  mounted() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo')); //on récupère les infos de connection
    if (userInfo) { //On vérifie si l'utilisateur s'est connecté, sinon on le renvoie vers la page login
    this.prenom = userInfo.prenom;
    this.id = userInfo.id;
    this.token = userInfo.token;

    this.getAllPosts(); //Appel de la fonction qui charge l'ensemble des posts sur le fil d'actu
    }

    else this.$router.push({ name: 'login' });

  },

  methods: {

    getAllPosts() {
      //Appel à l'API
      const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`
        }
      };
      this.waiting = true;
      fetch("http://localhost:3000/api/posts", options)
      //Cas où la réponse est OK
      .then (res => {if (res.status == 200) {res.json ()
        .then (json => {
          const divToFill = document.getElementById('postsDiv');
          
          //Si il n'y a aucun poste
          if (json.length===0) {
            let nopublication = document.createElement("p");
            nopublication.textContent = "Aucun post. Soyez le premier à publier un article !";
            divToFill.appendChild(nopublication);
          }
          
          //Sinon, boucle sur tous les posts
          for (let i = 0; i < json.length; i++) {
            let newDiv = document.createElement("div");
            newDiv.className = "post";
            //Pour chaque post, possibilité d'être redirigé sur la page détails
            newDiv.addEventListener('click', () => {this.$router.push("post/"+json[i].numero);})
            divToFill.appendChild(newDiv);

            //Titre du post
            let newH2 = document.createElement("h2");
            newH2.textContent = json[i].title;
            newDiv.appendChild(newH2);

            //Affichage du média s'il y en a un
            if (json[i].image_url) {
            const imageContainer = document.createElement("div");
            newDiv.appendChild(imageContainer);
            const mediaExtension = json[i].image_url.substr((json[i].image_url.lastIndexOf('.') + 1));
              //Si c'est une vidéo
              if (mediaExtension === 'mp4') {
              const newVideo = document.createElement("video");
              newVideo.src = json[i].image_url;
              newVideo.controls = true;
              newVideo.textContent = json[i].image_url;
              imageContainer.appendChild(newVideo);
              }
              //Sinon c'est forcément une image
              else {
              const newImage = document.createElement("img");
              newImage.src = json[i].image_url;
              newImage.alt = json[i].image_url;
              imageContainer.appendChild(newImage);
              }
            }
            
            //Affichage de la photo de profil en miniature
            const miniprofil = document.createElement("p");
            newDiv.appendChild(miniprofil);
            miniprofil.textContent = `Publié par ${json[i].prenom} `;
            
            //Affiche depuis quand le post est publié
            const publishedOn = document.createElement("p");
            //La réponse de la database nous indique depuis combien d'heures/min/sec le post est publié sous le format hhh:mm:ss
            //On ne sélectionne que la partie "heures" pour la suite de la logique
            const hoursSincePost = parseInt(json[i].date.substring(0,json[i].date.indexOf(':')));
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
            newDiv.appendChild(publishedOn);

          } //Fin de la boucle de création des posts
          })

          //Si échec requête (par exemple code 401 "non autorisé") renvoi page d'accueil
        } else {res.json ().then (() => {this.$router.push({ name: 'login' });})}
      })
    
      //Cas où le serveur ne répond pas
      .catch (() => {
      this.waiting=false;
      this.success= false;
      this.message = "Erreur serveur ! ";
      })
    },

    //Effacement des données de connection et redirection vers la page login
    disconnection() {
      localStorage.clear();
      this.$router.push({ name: 'login' });
    }

  } //Fin des méthodes
  
}
</script>

<style lang="scss">

#nav {
  display: flex;
  justify-content: flex-end;
}
header {
  justify-content: space-between;
}
#postsDiv{
  display: flex;
  flex-wrap: wrap;
}
.post {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow: 5px 5px 10px grey;
  margin:30px auto;
  padding:5px;
  width:45%;
  background-color: #d4d3d3;
  transition: all 400ms;

    &:hover { 
      opacity: 0.6;
      cursor:pointer;
  }
}

//L'affichage prend 90% de la page sur écran mobile
@media screen and (max-width: 600px) {
  .post {width:90%;}
}

//Limitation taille affichage vidéo et image
img, video {
  max-width:100%;
  max-height:250px;
}

</style>