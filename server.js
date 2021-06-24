require('dotenv').config()
const express = require("express");


const cors = require("cors");
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');


const PORT = process.env.PORT || 8080;
const app = express();

var corsOptions = {
    origin: "http://localhost:8080"
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Database connection establish
require("./Routes/user.routes")(app);

const url = 'mongodb://localhost:27017/';
const dbName = 'qoutesDatabasse';

// Use connect method to connect to the server
MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
    assert.equal(null, err);
    console.log('Connected successfully to server');

    const db = client.db(dbName);
    // storing for acesssing it later
    app.locals.db = db;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });

});





app.get("/", (req, res) => {
    res.json({ message: "Welcome to Qoutes World." });
});

// set port, listen for requests
