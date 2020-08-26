var express = require("express");
var Book = require("../models/book");
var Comment = require("../models/comment");
var router = express.Router({mergeParams: true});
var middleware = require("../middleware");

//Comments new
router.get("/new", middleware.canComment, function(req, res){
    // find book by id
    Book.findById(req.params.id, function(err, book){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {book: book});
        }
    });
});

//Comments create
router.post("/", middleware.canComment, function(req, res){
   //lookup book using ID
   Book.findById(req.params.id, function(err, book){
       if(err){
           console.log(err);
           res.redirect("/books");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               req.flash("error", "Something went wrong!");
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               book.comments.push(comment);
               book.save();
              // req.flash("success", "Successfully added comment!");
               res.redirect('/books/' + book._id);
           }
        });
       }
   });
});

//edit comment route
router.get("/:comment_id/edit", middleware.canComment, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
       if(err){
           res.redirect("back");
       } else {
            res.render("comments/edit", {book:req.params.id, comment: foundComment}); 
       }
    });
});

// update comment route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        }  else {
            res.redirect("/books/" + req.params.id );
        }
  });
});

// comment destroy route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   //find by id and remove
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
      if(err){
          res.redirect("back");
      } else {
          req.flash("success", "Comment deleted!");
          res.redirect("/books/" + req.params.id);
      }
   });
});

module.exports = router;