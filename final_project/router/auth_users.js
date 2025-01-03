const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js"); // Assuming this is the module that contains the books object
const regd_users = express.Router();

let users = [
  {
    firstName: "Kuth",
    lastName: "Chi",
    email: "kuthchi@outlook.com",
    DOB: "04-06-1987",
    password: "password123"
  },
  {
    firstName: "Lihin",
    lastName: "Yoay",
    email: "yoay.lihin@gmail.com",
    DOB: "21-12-1999",
    password: "mysecretpass"
  },
  {
    firstName: "Sethika",
    lastName: "Chi",
    email: "chi.sethika@apple.com",
    DOB: "12-12-2020",
    password: "applelover"
  },
];

// Helper functions
const isValid = (username) => {
  return users.some(user => user.email.toLowerCase() === username.toLowerCase());
};

const authenticatedUser = (username, password) => {
  const user = users.find(user => user.email.toLowerCase() === username.toLowerCase());
  return user && user.password === password;
};

// Only registered users can log in
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!isValid(username)) {
    return res.status(404).json({ message: "Invalid username" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const user = users.find(user => 
    user.email.toLowerCase() === username.toLowerCase() && user.password === password
  );

  if (user) {
    const accessToken = jwt.sign(
      { email: user.email },
      'access',
      { expiresIn: '2h' } 
    );
    req.session.authorization = { accessToken };
    return res.status(200).json({ message: "User successfully logged in", accessToken });
  } else {
    return res.status(500).json({ message: "An error occurred" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({message: "User is not authenticated."});
  }

  try {
    const user = jwt.verify(token, 'access'); // Ensure the key matches the signing key
    const username = user.email;

    if (!books[isbn]) {
      return res.status(404).json({message: "Book not found."});
    }

    books[isbn].reviews = books[isbn].reviews || {};
    books[isbn].reviews[username] = review;

    return res.status(200).json({message: `${username} ${review}`});
  } catch (err) {
    return res.status(403).json({message: "Invalid token or session expired."});
  }
});

// Delete review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: "User is not authenticated." });
  }

  try {
    const user = jwt.verify(token, 'access'); 
    const username = user.email;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found." });
    }

    if (books[isbn].reviews && books[isbn].reviews[username]) {
      delete books[isbn].reviews[username]; 
      return res.status(200).json({ message: "Review deleted successfully." });
    } else {
      return res.status(404).json({ message: "Review not found for this user." });
    }
  } catch (err) {
    return res.status(403).json({ message: "Invalid token or session expired." });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
