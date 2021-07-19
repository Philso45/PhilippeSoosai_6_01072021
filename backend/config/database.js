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

//Affiche "Connected to groupomania à la console si la connexion est réussit"
connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected to groupomania!");
});

module.exports = connection;
