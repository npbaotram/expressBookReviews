const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
     res.send(JSON.stringify({books}, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
   

    const bookDetails = books[isbn]; 
    if (bookDetails) {
        // If book details are found, return them as a JSON response
        return res.status(200).json(bookDetails);
      } else {
        // If book details are not found, return an appropriate message
        return res.status(404).json({ message: 'Book not found' });
      }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
   // const title = req.params.title;
    //const reviews = req.params.reviews;
    // Iterate through the books
  for (const bookKey of Object.keys(books)) {
    const book = books[bookKey];
    if (book.author === author) {
      // Found a book by the specified author
      return res.status(200).json(book);
    }
  }
    return res.status(404).json({ message: 'No book found for this author' });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    for (const bookKey of Object.keys(books)) {
        const book = books[bookKey];
        if (book.title === title) {
          // Found a book by the specified author
          return res.status(200).json(book);
        }
      }
        return res.status(404).json({ message: 'No book with this title' });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
   

    const bookDetails = books[isbn]; 
    if (bookDetails) {
        // If book details are found, return them as a JSON response
        return res.status(200).json(bookDetails);
      } else {
        // If book details are not found, return an appropriate message
        return res.status(404).json({ message: 'Book not found' });
      }
});

module.exports.general = public_users;
