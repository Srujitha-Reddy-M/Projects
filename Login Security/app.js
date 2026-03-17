//jshint esversion:6

//dotenv to use a secret saved in .env file to encrypt the password
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

// using hashing for password
// const md5 = require('md5');

//using bcrypt to hash the password for 'n' times
// const bcrypt = require('bcryptjs');
// const salt = bcrypt.genSaltSync(10);

//using express-session and passport modules for session and cokkies
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");   //passport-local is a dependency for this and need not be required explicitly

//using google oAuth to authenticate the users
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");

//using facebook to login 
const FacebookStrategy = require('passport-facebook');


const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

//setup the session configuration
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
//configure passport 
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: Array
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const userModel = new mongoose.model("user", userSchema);

//create a local strategy to use username and password for authentication
passport.use(userModel.createStrategy());

//serialize and deserialize to transmit the user session details using cookies for local method
// passport.serializeUser(userModel.serializeUser());
// passport.deserializeUser(userModel.deserializeUser());

//serialize and deserialize for any method
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        username: user.username,
    });
    
    });
});
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    userModel.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



app.get("/", function(req,res){
    res.render("home");
});

app.get("/auth/google", passport.authenticate("google", {scope: ["profile"]}));

app.get("/auth/google/secrets", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets page.
    res.redirect("/secrets");
  });

app.get("/login", function(req,res){
    res.render("login");
});

app.get("/register", function(req,res){
    res.render("register");
});

app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        userModel.find({"secret": {$ne: null}}).then(function(foundUsers){
            if(foundUsers){
                res.render("secrets", {usersWithSecrets: foundUsers});
            }
        }).catch(function(err){
            console.log(err);
        });
    }else{
        res.redirect("/login");
    }
});

app.get("/submit", function(req, res){
    if(req.isAuthenticated()){
        res.render("submit");
    }else{
        res.redirect("/login");
    }
});

app.get("/logout", function(req, res){
    req.logout(function(err){
        console.log(err);
    });
    res.redirect("/");
});

app.post("/submit", function(req, res){
    const submittedSecret = req.body.secret;

    // console.log(req.user.id);
    userModel.findById(req.user.id).then(function(foundUser){
        if(foundUser){
            foundUser.secret.push(submittedSecret);
            foundUser.save().then(function(){
                res.redirect("/secrets");
                }).catch(function(err){
                    res.send(err);
                });
        }
    }).catch(function(err){
        res.send(err);
    });
});

//register and login using session and cokkies
app.post("/register", function(req, res){
    userModel.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
});


app.post("/login", function(req, res){

    const newUser = new userModel({
        username: req.body.username,
        password: req.body.password
    });

    req.login(newUser, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
});



//register and login using hashing 

// app.post("/register", function(req,res){

//     var hash = bcrypt.hashSync(req.body.password, salt);
       
//         const newUser = new userModel({
//             email: req.body.username,
//             password: hash
//         });

    
//         newUser.save().then(function(){
//             res.render("secrets");
//         }).catch(function(err){
//             res.send(err);
//         });
// });

// app.post("/login", function(req,res){
//     const username = req.body.username;
//     const password = req.body.password;

//     userModel.findOne({email: username}).then(function(foundUser){
//         if(foundUser){
//             var result = bcrypt.compareSync(password, foundUser.password);
//             if(result === true){
//                 res.render("secrets");
//             }else{
//                 console.log(err);
//                 res.render("login");
//             }    
//         }
//     }).catch(function(err){
//         res.send(err);
//     });
// });


app.listen(3000, function(){
    console.log("Server started on port 3000");
});