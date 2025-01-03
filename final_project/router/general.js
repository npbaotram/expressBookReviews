const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');

const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { firstName, lastName, email, DOB, password } = req.body;

  if (!firstName || !lastName || !DOB || !email || !password) {
    return res.status(400).json({message: "All field are required"})
  }

  const userExists = users.find(user=>user.email.toLowerCase() === email.toLowerCase())
  if (userExists) {
    return res.status(409).json({ message: "User already exists"});
  }

  const newUser = {
    firstName,
    lastName,
    email,
    DOB,
    password,
  };

  users.push(newUser);

  return res.status(201).json({message: "Successfully registered"});
});


// Get the book list available in the shop
public_users.get('/', (req, res) => {
  // Create a promise to check if books are available
  new Promise((resolve, reject) => {
    if (Object.keys(books).length < 1) {
      reject("Book is not available!");
    } else {
      resolve(books);
    }
  })
  .then(books => {
    // Respond with the available books
    return res.status(200).json({ shop: books });
  })
  .catch(err => {
    // Handle the error
    return res.status(404).json({ message: err });
  });
});

// Async function to get books using Axios
async function getBooks(callback) {
  try {
    const response = await axios.get('http://localhost:5000/'); // Replace with your actual endpoint
    callback(null, response.data); // Call the callback with the data
  } catch (error) {
    callback("Unable to fetch books: " + error.message); // Call the callback with an error
  }
}

// Example usage of getBooks with callback
getBooks((error, books) => {
  if (error) {
    console.error(error);
  } else {
    console.log("Books available in the shop:", books);
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = parseInt(req.params.isbn);

  new Promise( (resolve, reject) => {
    if (isbn > books.length || !books[isbn]) {
      reject("Book not found");
    } else {
      resolve(books[isbn]);
    }
  })
  .then(book => {
    return res.status(200).json(book);
  })
  .catch(err => {
    return res.status(404).json({ message: err });
  });
});

  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  //Write your code here
  const reqAuthor = req.params.author.toLowerCase();

  new Promise(async (resolve, reject) => {
    const matchingBooks = Object.values(books).filter((book) => book.author.toLowerCase() === reqAuthor);
    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject("No books matching this author!");
    }
  }).then(matchingBooks => {
    return res.status(200).json(matchingBooks);
  }).catch(err => {
    return res.status(404).json({
      message: err
    });
  })
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const reqTitle = req.params.title.toLowerCase();

  new Promise((resolve, reject) => {
    const matchingBookTitle = Object.values(books).filter((book) => 
      book.title.toLowerCase() === reqTitle
    );
    
    if (matchingBookTitle.length > 0) {
      resolve(matchingBookTitle);
    } else {
      reject("No books found with this title");
    }
  })
  .then(matchingBookTitle => {
    return res.status(200).json(matchingBookTitle);
  })
  .catch(err => {
    return res.status(404).json({ message: err });
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = parseInt(req.params.isbn, 10);

  if (books[isbn]){
    const reviews = books[isbn].reviews;
    return res.status(200).json({
      isbn,
      title: books[isbn].title,
      reviews
    });
  } else {

    return res.status(404).json({message: "Book not found"});
  }

});

public_users.put('/books/reviews/:isbn', function (req, res) {

  if (!req.session || !req.session.authorization || !req.session.authorization.username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const { review } = req.query;
  const { isbn } = req.params;
  const username = req.session.authorization.username;

  // Check if the book with the provided ISBN exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Initialize reviews if they don't exist
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update the review for the specified ISBN
  books[isbn].reviews[username] = review;

  // Respond with a success message
  return res.status(200).json({ message: "Review added/updated successfully" });

});

module.exports.general = public_users;
