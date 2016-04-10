var mongoose = require('mongoose');
var UsersList = require('./auth.js');

module.exports = {
  getUserDetails : function(userid, res){
    UsersList.find({_id: userid}, function (err, data) {
        if (err) throw err;
        res.json(data);
    });
  },
  saveNewUserDetails : function(obj, res){
    var newUser = new UsersList(obj);
    // save the user
    newUser.save(function (err, data) {
        if (err) res.json(err);
        console.log('Contact created!');
        res.json(data);
    });
  },
  updateUserDetails : function(userid, obj, res){
    UsersList.findByIdAndUpdate(userid, obj, function (err, user) {
        if (err) throw err;
        console.log("Contact updated")
        console.log(user);
        res.json(user);
    });
  },
  loginUser : function(uname, pword, res){
    UsersList.find({ username: uname, password: pword }, function (err, data) {
        if (err) throw err;
        res.json(data);
    });
  },
  getUsersByGroup : function(groupname, res){
    UsersList.find({ group: groupname}, function (err, data) {
        if (err) throw err;
        res.json(data);
    });


  }


}
