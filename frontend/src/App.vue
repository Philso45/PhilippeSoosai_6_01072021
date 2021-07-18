<!-- Template du footer -->
<template>
  <div id="app">
    <router-view/>
    <footer class="footer">
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
			return `Copyright projet Groupomania Philippe Soosai ${currentYear}`
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
}

ul {
  list-style:none;
}

/*#add, li {
  margin:10px 0;
  transform: scale(1);
  transition: all 400ms;
    &:hover {
      transform: scale(1.1);
      opacity: 0.6;
      cursor:pointer;
    }
}*/

a {
  text-decoration: none;
  &:hover {
    color: red;
  }
}

#nav li{
    font-weight: bold;
    color: #381302;
    margin: 10px 20px;

    &:hover  {
      color: red;
    }
}

footer {
  margin-top: 70px;
  padding-bottom: 20px;
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
