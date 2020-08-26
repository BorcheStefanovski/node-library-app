var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

//root route landing page
router.get("/", function(req, res){
    res.render("landing");
});

// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});
//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    if(req.body.adminCode === "secretcode123!"){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){ // gotov metod od user model od mongoose local za kreiranje useri
        if(err){
                console.log(err);
                return res.render("register", {error: err.message});
                }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Welcome " + user.username + ", you have signed up successfully.");
           res.redirect("/books"); 
        });
    });
});

// show login form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});
// handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/books",
        failureRedirect: "/login"
    }), function(req, res){
});

//logout logic route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged out!");
   res.redirect("/books");
});

module.exports = router;