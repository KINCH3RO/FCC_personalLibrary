/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("connected succesfully");
});
const bookSchema = new mongoose.Schema(
  {

    title: String,
    comments: [String],
    commentcount: Number

  }
)
const BookModel = mongoose.model("book", bookSchema);
module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let books = await BookModel.find({});

      res.json(books);
    })

    .post(function (req, res) {
      let title = req.body.title;
      if (!title) {
        res.end("missing required field title");
        return;
      }
      const book = new BookModel({ title: title, comments: [], commentcount: 0 });
      book.save((err, newBook) => {
        if (err) console.error(err);
        res.json({ _id: newBook._id, title: newBook.title });
      })
      //response will contain new book object including atleast _id and title
    })

    .delete(function (req, res) {
     
      BookModel.collection.drop();
      res.end("complete delete successful")


    });



  app.route('/api/books/:id')
    .get(function (req, res) {
      let bookid = req.params.id;
      BookModel.findById(bookid, function (err, book) {
        if (book) {
          res.json(book)
        } else {
          res.end("no book exists");
        }
      });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      
      if (!bookid) {
        res.end("no book exists");
        return;
      }
      if (!comment) {
        res.end("missing required field comment");
        return;
      }
      BookModel.findById(bookid, function (err, book) {
        if (book) {
          book.comments.push(comment);
          book.commentcount = book.comments.length;
          book.save();
          res.json(book)
        } else {
          res.end("no book exists");
        }
      });
      //json res format same as .get
    })

    .delete(function (req, res) {
      
      let bookid = req.params.id;
      BookModel.findByIdAndDelete(bookid, (err, doc) => {
        if (doc) {
          res.end("delete successful");
          return;
        }
        res.end("no book exists");


      })
    });

};
