require('dotenv').config();

var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    expressSanitizer= require("express-sanitizer"),
    Book            = require("./models/book"),
    Comment         = require("./models/comment"),
    User            = require("./models/user"),
    seedDB          = require("./seeds")

//requiring routes    
var commentRoutes = require("./routes/comments"),
    booksRoutes = require("./routes/books"),
    indexRoutes = require("./routes/index");
    
    
mongoose.connect("mongodb://localhost/library");
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment'); // including moment js
// seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user; // prakjanje na user od sesija na site templejti
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/books", booksRoutes);
app.use("/books/:id/comments", commentRoutes);

//server config
// app.listen(process.env.PORT, process.env.IP, function(){
//    console.log("The Library Server Has Started!");
// });

// Local server config
app.listen(3000, () => {
	console.log('Server is up on port 3000!');
});