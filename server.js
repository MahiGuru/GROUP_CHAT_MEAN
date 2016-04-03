var express = require('express');
var app = express();
var http = require("http").Server(app);
var bodyParser = require("body-parser");
var path = require('path');
var methodOverride = require("method-override");
var UsersList = require('./public/db/auth.js');
var mongoose = require('mongoose');
var io = require('socket.io')(http);

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type : "application/vnd.api+json" }));
app.use(methodOverride());

app.all('/', function (req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('index.html', { root: __dirname });
});


app.post("/api/getUserDetail", function (req, res) {
    console.log(req.body.userid)
    UsersList.find({_id: req.body.userid}, function (err, data) {
        if (err) throw err; 
        res.json(data);
    });
}); 
app.put("/api/userDetailsUpdate/:userid", function (req, res) {
    console.log(req.body)
    UsersList.findByIdAndUpdate(req.params.userid, req.body, function (err, user) {
        if (err) throw err; 
        console.log("Contact updated")
        console.log(user);
        res.json(user);
    });
}); 
app.post("/api/login", function (req, res) {
    console.log(req.body.username + " - " + req.body.password);
    UsersList.find({ username: req.body.username, password: req.body.password  }, function (err, data) {
        if (err) throw err;
        res.json(data);
    });
});
app.post("/api/createUser", function (req, res) {
    // create a new user
    console.log(req.body);
    var newUser = new UsersList(req.body);
    // save the user 
    newUser.save(function (err, data) {
        if (err) res.json(err);
        console.log('Contact created!');
        res.json(data);
    });
}); 
// When a client connects, we note it in the console
io.on('connection', function (socket) {
     
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    }); 
    socket.on("socketInput", function (userMsg) {
        console.log(userMsg);
        //emit to all broad casters including sender
        io.emit('socketInput', userMsg);
    }); 

});

http.listen(1337, function () {
    console.log("Server is running on port 1337");
    
});
