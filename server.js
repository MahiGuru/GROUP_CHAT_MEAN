var express = require('express');
var app = express();
var http = require("http").Server(app);
var bodyParser = require("body-parser");
var path = require('path');
var methodOverride = require("method-override"); 
var mongoServices = require('./public/db/mongoservices.js');
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
    mongoServices.getUserDetails(req.body.userid, res);
});
app.put("/api/userDetailsUpdate/:userid", function (req, res) {
    /// Update User Details
    mongoServices.updateUserDetails(req.params.userid, req.body, res);
});
app.post("/api/login", function (req, res) {
    /// Login User
    mongoServices.loginUser(req.body.username, req.body.password, res);
});
app.post("/api/createUser", function (req, res) {
    // create a new user
    mongoServices.saveNewUserDetails(req.body, res);
});

app.get("/api/groupUsers/:group", function(req, res) {
  ///Retrieve users based on GROUP
    mongoServices.getUsersByGroup(req.params.group, res);

});

// When a client connects, we note it in the console
io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
    //emit to all broad casters including sender
    socket.on("groupUsersChat", function (userMsg) {
        io.emit('groupUsersChat', userMsg);
    });
    ///retrieving user chat information using below method.
    socket.on("individualUserChat", function(userInfo){
      io.emit("individualUserChat", userInfo);
    });
    ///check user is available or not
    socket.on("userAvailable", function(userStatus){
        io.emit("userAvailable", userStatus);
    });

});

http.listen(1337, function () {
    console.log("Server is running on port 1337");

});
