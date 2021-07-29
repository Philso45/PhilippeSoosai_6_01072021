<template>
  <div class="signup">
    <header class="header">
      <div id="logo">
        <img alt="Groupomania logo" src="../assets/logonoir.png" />
      </div>
    </header>
    <div class="container">
      <h2> Creez votre compte</h2>

      <!--Formulaire de création de compte-->
      <form id="form" @submit = "sendForm"><!--Propriété vue.js permettant de gerer l'évènement au click-->

        <div class="first">
          <!--Champs Prénom requis-->
          <label for="prenom">Prénom* <span class="required"></span> </label>
          <input @input = "checkForm" type="text" id="prenom" name="prenom" required>

          <!--Champs Nom requis-->
          <label for="nom">Nom* <span class="required"></span> </label>
          <input @input = "checkForm" type="text" id="nom" name="nom" required>  
        </div>

        <div class="second">
          <!--Champs Email requis-->
          <label for="mail">E-mail <span class="required">*</span> </label>
          <input @input = "checkForm" type="email" id="mail" name="email" required>

          <!--Champs MDP requis-->
          <label for="pass">Mot de passe <span class="required">*</span> </label>
          <input @input = "checkForm" type="password" id="pass" name="password" minlength="8" required>
        </div>
          
        <!--Lien upload photo de profil requis-->
        <label for="imageurl" class="imageprofil">Télécharger une photo de profil *</label>
        <input @input = "checkForm" @change = "loadImagePreview" type="file" id="imageurl" name="imageurl" required accept="image/*">
        <div class="image-preview" v-if="imageLoaded===true">
          <img src="" alt="aperçu de votre image" class="image-preview__image"> 
        </div>

         <!--Libellé indiquant que les champs sont requis-->
        <div class="required"> * Champs requis </div>
        <input type="submit" id="signupButton" value="S'inscrire" disabled>
      </form>
      <!--v-show directive toggle la data, affiche l'erreur si besoin uniquement-->
      <p id="erreur" v-show="success===false"> Echec de l'inscription : {{message}} </p>

      <div id="dejaCompte">
        <p> Déjà un compte ? <router-link to="/">Se connecter</router-link> </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Signup',
  data: function() {
    return {
    imageLoaded: false, //Affichage de la photo de profil si elle est chargé
    success: true, //affichage d'un message d'erreur si echec de l'inscription
    message :"", //message d'erreur
    }
  },
  methods: {
    //Vérification en direct de la validité du formulaire. Le bouton "Envoyer" n'est clickable que si tous les champs sont OK
    checkForm() {
      if (document.getElementById("mail").checkValidity() 
      && document.getElementById("pass").checkValidity() 
      && document.getElementById("prenom").checkValidity()
      && document.getElementById("nom").checkValidity()
      && document.getElementById("imageurl").checkValidity()) {
        document.getElementById("signupButton").disabled = false;
      }
      else document.getElementById("signupButton").disabled = true;
    },
    //Fonction de prévisualisation de l'imageurl
    loadImagePreview() {
      const fileUploaded = document.getElementById("imageurl").files[0];
      if (fileUploaded) {
        const reader = new FileReader();
        this.imageLoaded = true;
        reader.addEventListener("load", function() {
          document.getElementsByClassName('image-preview__image')[0].setAttribute("src", this.result);
        });
        reader.readAsDataURL(fileUploaded);
      }
      else {
        this.imageLoaded=false;
      }
    },
    //Fonction appelée lors de la soumission du formulaire
    sendForm(event) {
      event.preventDefault(); //On gère nous-mêmes l'appel backend
      const email= document.getElementById("mail").value;
      const password = document.getElementById("pass").value;
      const prenom = document.getElementById("prenom").value;
      const nom = document.getElementById("nom").value;
      const user = { "email": email, "password": password, "prenom": prenom, "nom": nom};
      const fileToSend = event.target.imageurl.files[0];
      //Si l'imageurl fait plus de 1Mb, on le bloque avant envoi à l'API
      if (fileToSend.size > 1*1000*1000) {
        this.waiting=false;
        this.success = false;
        this.message = "La taille maximale du fichier doit être de 1Mb";
      }
      //Envoi de l'image sous forme de fichier et des autres infos sous format JSON
      else {
        let formData = new FormData();
        formData.append('user', JSON.stringify(user));
        formData.append('image', fileToSend);
        this.waiting = true;
        const options = {
          method: 'POST',
          body: formData,
          headers: {'Accept': 'application/json, text/plain, */*'}
        };
        fetch("http://localhost:3000/api/auth/signup", options)
          .then (res => {
            if (res.status == 201) {
              this.success=true;
              this.waiting=false;
              this.$router.push({ name: 'login' }); //Renvoie vers la page de login
            }
            else {res.json ()
              .then (json => {
                this.waiting=false;
                this.success = false;
                this.message = json.error;
              }
            )}
          })
          .catch (() => {
            this.waiting=false;
            this.success= false;
            this.message = "Erreur server !";
          })
      }
    }
  }
}
</script>

<style lang="scss">
form > p {
  font-size:14px;
  font-style: italic;
  margin-top:0;
}


.image-preview {
  width:300px;
  min-height:100px;
  margin-top:15px;
  margin: auto;
  &__image {
    width:100%;
  }
}
h2 {
  padding-top: 10px;
}
.container {
  box-shadow: 0px 1px 6px 0px;
  width: 70%;
  margin: auto;
}
label {
  margin-top: 25px;
}
.first {
  display: flex;
  justify-content: space-around;
  width: 50%;
  margin: auto;
}
.second {
  display: flex;
  flex-direction: column;
  width: 50%;
  margin: auto;
}

.required {
  color:#AD0000;
}
input[type="file"] {
    display: none;
}
.imageprofil {
    border: none;
    display: inline-block;
    padding: 6px 12px;
    cursor: pointer;
    margin:10px;
}
#signupButton {
  margin:20px auto 0;
  height:auto;
  border:none;
  padding:10px;
  width: 30%;
  border-radius:8px;
  background:black;
  color:#fff;
  font-size:20px;
  cursor:pointer;

  &:disabled {
  background: grey;
  color:rgb(200, 200, 200);
  cursor:auto;
  }
}

#dejaCompte {
  padding-bottom: 20px;
}

#dejaCompte a {
  font-weight:bold
}
</style>