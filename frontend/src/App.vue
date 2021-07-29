<!-- Template du footer -->
<template>
  <div id="app">
    <router-view/>
    <footer class="footer">
      <ul>
        <a href="#"><li>Mentions légales</li></a>
        <a href="#"><li>Contact</li></a>
        <a href="#"><li>CGV</li></a>
        <a href="#"><li>A propos</li></a>
      </ul>
      <div id="logo">
        <img alt="Groupomania logo" src="./assets/logonoir.png" />
      </div>
      <p>{{ copyright }}</p>
    </footer>
  </div>
</template>

<script>
  
// Copyright du footer
export default {
  computed: {
		copyright() {
			const currentYear = new Date().getFullYear()
			return `Tous droits reservés ${currentYear}`
		}
  }
}

</script>

<style lang="scss">

header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top:5px;
  border-bottom:2px solid black;
}

ul {
  list-style:none;
}
footer ul li {
  font-size: 0.8em;
  margin: 7px 0;
  padding-top: 20px;
}

#add, li {
  margin:25px 0;
  font-size:1.3em;
  transform: scale(1);
  transition: all 400ms;
    &:hover {
      transform: scale(1.1);
      opacity: 0.6;
      cursor:pointer;
    }
}

a {
  text-decoration: none;
  &:hover {
    color: grey;
  }
}

#nav li{
    color: #381302;
    margin: 10px 20px;

    &:hover  {
      color: grey;
    }
}

footer {
  margin-top: 70px;
  padding-bottom: 20px;
  background-color: #efebeb;
}

label {
  margin-top:5px;
  font-size:20px;
}
input {
  margin:10px;
  padding: 10px;
  height:24px;
}

#erreur {
  color:#AD0000;
  font-weight: bold;
}

#app {
  font-family: Arial, sans-serif;
  text-align: center;
  color: black;
  background-color: white;
}

</style>
