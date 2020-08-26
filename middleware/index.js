//all the middleware goes here
var middlewareObj = {};
var Book = require("../models/book");
var Comment = require("../models/comment");

//book middleware
middlewareObj.checkBookOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Book.findById(req.params.id, function(err, foundBook){
           if(err){
               req.flash("error", "Not Found");
               res.redirect("back");
           }  else {
               // does user own the book?
            if(req.user.isAdmin) { // foundBook.author.id.equals(req.user._id) || 
                next();
            } else {
                req.flash("error", "Permission denied");
                res.redirect("/books");
            }
           }
        });
    } else {
        req.flash("error", "Permission denied");
        res.redirect("/books");
    }
};
//comment middleware
middlewareObj.checkCommentOwnership = function(req, res, next) {
 if(req.isAuthenticated()){ // checking Is the user logged in
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               res.redirect("back");
           }  else {
               // does user own the comment?
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("error", "Permission denied!");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
};
//checking is user logged in and is user an admin -- middleware
middlewareObj.isLoggedIn = function(req, res, next){     
    if(req.isAuthenticated() && req.user.isAdmin){
        return next();
         }
    req.flash("error", "Permission denied");
    res.redirect("/books");
};

//checking is user logged in and is user an admin -- middleware
middlewareObj.canComment = function(req, res, next){     
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
};

module.exports = middlewareObj;