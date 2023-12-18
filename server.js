// By mr. AT, ChatGPT, and some MKazm
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Create a new SQLite in-memory database
const db = new sqlite3.Database("mainDatabase");
// Create a users table if it doesn't exist
db.run(
  `
  CREATE TABLE IF NOT EXISTS users (
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL
    )
    `,
  (err) => {
    if (err != null) {
      console.log("Error w Creating Table.", err);
    }
  }
);

app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(__dirname));

app.get("/healthcheck", (req, res) => {
  res.status(200).json({ message: "ok" });
});

// Handle registration request
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  // Check if a user with the given username already exists
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      console.log("Error w SELECT username.");
      return res.status(500).json({ error: err });
    }

    if (row) {
      return res.status(409).json({ message: "Username is already in use" });
    }
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
      if (err) {
        console.log("Error w SELECT email.");
        return res.status(500).json({ error: err });
      }

      if (row) {
        return res.status(409).json({ message: "Email is already in use" });
      }

      // Add the new user to the database
      db.run(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, password],
        (err) => {
          if (err) {
            return res.status(500).json({ error: err });
          }

          // Send a success response
          return res.json({ message: "User registered successfully" });
        }
      );
    });
  });
});

// Handle login request
app.post("/login", (req, res) => {
  const { username, email, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err != null) {
      console.log("Error w SELECT.");
      return res.status(500).json({ error: err });
    }

    if (row) {
      console.log("Poprawny username");
      //   return res.status(200).json({ message: "Poprawny username" });
      if (row) {
        const dbPassword = row.password;
        if (password === dbPassword) {
          console.log("Poprawne hasło");
          return res.status(200).json({ message: "Poprawne hasło" });
        } else {
          console.log("Niepoprawne hasło");
          return res.status(401).json({ error: "Niepoprawne hasło" });
        }
      }
    }
  });
});

// Start the server on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
