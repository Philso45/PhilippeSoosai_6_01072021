<!-- Contenue de ma page de connexion -->
<template>
  <div id="login">
    <header class="header">
      <div id="logo">
        <img alt="Groupomania logo" src="../assets/logonoir.png" />
      </div>
    </header>
    <h1> Je m'identifie</h1>

    <!--Formulaire de connexion-->
    <form id="connexion" @submit = "sendForm">
      <label for="email">Adresse e-mail : </label>
      <input @input = "checkForm" type="email" id="email" name="email" required>
      
      <label for="mdp">Mot de passe : </label>
      <input @input = "checkForm" type="password" id="mdp" name="password" minlength="8" required>
      <input type="submit" id="Ulogin" value="Connexion" disabled>
    </form>

    <div class="loader" v-show="waiting===true"></div>
    <p id="erreur" v-show="success===false"> {{message}} </p>
    <div id="sign">
      <p> Pas encore de compte ? <router-link to="/signup">Créer un compte</router-link> </p>
    </div>
  </div>
</template>

<script>

export default {
  data: function() {
    return {
    success: true, //affichage d'un message d'erreur si le mot de passe est false
    waiting: false, 
    message :"", //message d'erreur
    }
  },
  methods: {

    //Vérification de la validité du formulaire. Le bouton Connexion n'est clickable que si tous les champs sont OK sinon il reste disabled
    checkForm() {
      if (document.getElementById("email").checkValidity() 
        && document.getElementById("mdp").checkValidity()) {
        document.getElementById("Ulogin").disabled = false;
      }
      else document.getElementById("Ulogin").disabled = true;
    },

    //Fonction appelée lors de la soumission du formulaire de connexion
    sendForm(event) {
      event.preventDefault(); //On gère nous-mêmes l'appel backend
      this.waiting = true;
      let email= document.getElementById("email").value;
      let password = document.getElementById("mdp").value;
      const options = {
        method: 'POST',
        body: JSON.stringify({"email": email, "password": password}),
        headers: {'Content-Type': 'application/json'}
      };
      fetch("http://localhost:3000/api/auth/login", options)
        .then (res => {
          if (res.status == 200) {res.json ()
            .then (json => {
              this.success=true;
              this.waiting=false;
              const userInfo = {id: json.id, prenom: json.prenom, token: json.token};
              //En cas de réussite, on stocke les identifiants de connexion et le token jusqu'à ce que l'utilisateur se déconnecte
              localStorage.setItem('userInfo', JSON.stringify(userInfo));
              this.$router.push({ name: 'posts' }); //Renvoi vers la page des posts
            })
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
          this.message = "Erreur serveur !";
        })
    }
  }
}
</script>

<style lang="scss">
#logo img {
  height: 80px;
}

h1 {
  margin-top: 60px;
}

#connexion {
  margin: 75px auto;
  height: 230x;
  display:flex; 
  box-shadow: 1px 2px 20px 0px;
  flex-direction: column;
  padding: 37px;
  max-width: 550px;
}

#Ulogin {
  margin:10px auto;
  height:auto;
  border:none;
	padding:10px;
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
a {
    font-weight: normal;
    color: #381302;
}
#sign {
  margin-bottom: 70px;
}

#sign a {

  font-weight: bold;
}
</style>