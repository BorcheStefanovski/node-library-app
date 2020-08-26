var mongoose = require("mongoose");

var bookSchema = new mongoose.Schema({
   name: String,
   image: String,
   description: String,
   price: String,
   bookAuthor: String,
   year: String,
   pages: String,
   location: String,
   lat: Number,
   lng: Number,
   createdAt: { type: Date, default: Date.now },
   author: {
      id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
      },
      username: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("Books", bookSchema);