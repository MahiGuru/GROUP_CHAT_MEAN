var mongoose = require('mongoose');
var options = {
    dbName : "<dbname>"
} 
mongoose.connect('mongodb://<dbusername>:<dbpassword>@ds011840.mlab.com:11840/<dbname>');


mongoose.connection.on('connected', function () {
    console.log("CONNECTED");
});
mongoose.connection.on('error', function () {
    console.log("ERROR CONNECTED");
});
mongoose.connection.on('disconnected', function () {
    console.log("DISCONNECTED");
});

var Schema = mongoose.Schema;

var userSchema = new Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true } ,
    password: { type: String, required: true },
    confpassword: { type: String, required: true } ,
    email: { type: String, required: true },
    group: { type: String, required: true },
    token : { type: String, required: true },
    nationality: { type: String, required: true },
    created_at: { type: Date, required: true },
    updated_at: { type: Date, required: true }
});
/*
userSchema.methods.dudify = function () {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        
        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        
        return text;
    // add some stuff to the users name
    this.token = "05"+text+"84"+text+"04"+text;
    
    return this.token;
};
*/

// on every save, add the date
userSchema.pre('save', function (next) {
    // get the current date
    var currentDate = new Date(); 
    // change the updated_at field to current date
    this.updated_at = currentDate;
    
    // if created_at doesn't exist, add to that field
    if (!this.created_at)
        this.created_at = currentDate;
    
    next();
});



var userslist = mongoose.model('users', userSchema);


module.exports = userslist;