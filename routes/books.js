var express = require("express");
var Book = require("../models/book");
var router = express.Router();
var middleware = require("../middleware");

var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//INDEX - show all books
// router.get("/", function(req, res){
//     var noMatch = '';
//     if(req.query.search){
//         const regex = new RegExp(escapeRegex(req.query.search), 'gi');
//         Book.find({name: regex}, function(err, allBooks){
//       if(err){
//           console.log(err);
//       } else {
//           if(allBooks.length < 1){
//               noMatch = "No books match that query, please try again!";
//           }
//           res.render("books/index",{books:allBooks, page: 'books', noMatch: noMatch});
//       }
//     });
//     } else {
//     // Get all books from DB
//     Book.find({}, function(err, allBooks){
//       if(err){
//           console.log(err);
//       } else {
//           res.render("books/index",{books:allBooks, page: 'books', noMatch:noMatch});
//       }
//     });
//     }
// });

//INDEX - show all books
router.get("/", function(req, res){
    var perPage = 12;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Book.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allBooks) {
            Book.count({name: regex}).exec(function (err, count) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    if(allBooks.length < 1) {
                        noMatch = "No books match that query, please try again.";
                    }
                    res.render("books/index", {
                        books: allBooks,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: req.query.search
                    });
                }
            });
        });
    } else {
        // get all books from DB
        Book.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allBooks) {
            Book.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("books/index", {
                        books: allBooks,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: false
                    });
                }
            });
        });
    }
});

//CREATE - add new book to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to books db
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.sanitize(req.body.description);
  var price = req.body.price;
  var year = req.body.year;
  var pages = req.body.pages;
  var bookAuthor = req.body.bookAuthor;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newBook = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng, price:price, bookAuthor:bookAuthor, year:year, pages:pages};
    // Create a new book and save to DB
    Book.create(newBook, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to books page
            res.redirect("/books");
        }
    });
  });
});

//NEW - show form to create new books
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("books/new"); 
});

// SHOW - shows more info about one book
router.get("/:id", function(req, res){
    //find the book with provided ID
    Book.findById(req.params.id).populate("comments").exec(function(err, foundBook){
        if(err){
            console.log(err);
        } else {
            console.log(foundBook);
            //render show template with that book
            res.render("books/show", {book: foundBook});
        }
    });
});

//EDIT BOOK ROUTE
router.get("/:id/edit", middleware.checkBookOwnership, function(req, res) {
   Book.findById(req.params.id, function(err, foundBook){
     res.render("books/edit", {book: foundBook}); 
      });
});
// UPDATE BOOK ROUTE
router.put("/:id", middleware.checkBookOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.book.lat = data[0].latitude;
    req.body.book.lng = data[0].longitude;
    req.body.book.location = data[0].formattedAddress;
    req.body.book.description = req.sanitize(req.body.book.description);

    Book.findByIdAndUpdate(req.params.id, req.body.book, function(err, book){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/books/" + book._id);
        }
    });
  });
});

//DESTROY book route
router.delete("/:id", middleware.checkBookOwnership, function(req, res){
   Book.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/books");
       } else {
           res.redirect("/books");
       }
   });
});

function escapeRegex(text){
 return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");   
}

module.exports = router;