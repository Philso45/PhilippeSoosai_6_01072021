const mysql = require('mysql2');

//Données DB cachées
require('dotenv').config();

//Infos de connexion à la DB
const connection = mysql.createConnection({
    host: "localhost",
    user: "groupomania",
    password: "azerty45",
    database: "Groupomania"
});

//Affiche "Connected à la console si la connexion réussit"
connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = connection;
