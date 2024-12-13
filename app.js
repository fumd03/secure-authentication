require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bcrypt = require("bcrypt");
const saltRounds = 10;

console.log(process.env.SECRET);

const app = express();
const port = 4000;

// Debug the loaded SECRET
if (!process.env.SECRET) {
    throw new Error("SECRET not defined in .env file");
}

// Middleware setup
app.use(express.static("public")); // Serve static files from the "public" folder
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data (from forms)
app.set("view engine", "ejs"); // Set EJS as the template engine

// MongoDB connection
const mongoDB = "mongodb://localhost:27017/fu"; // Local MongoDB instance
mongoose
    .connect(mongoDB)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

// Define User Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

// Create User Model
const User = mongoose.model("User", userSchema);

// Routes
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser = new User({
            email: req.body.username,
            password: hash,
        });

        newUser
            .save()
            .then(() => res.render("secrets"))
            .catch((err) => {
                console.error("Error saving user:", err);
                res.status(500).send("Error saving user");
            });
        // Store hash in your password DB.
    });
});

app.post("/login", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username })
        .then(function(foundUser) {
            if (foundUser) {
                console.log("Entered password:", password);
                console.log("Stored hashed password:", foundUser.password);

                bcrypt.compare(password, foundUser.password, function(err, result) {
                    if (err) {
                        console.log(err);
                        res.send("An error occurred while verifying the password.");
                    } else if (result === true) {
                        res.render("secrets");
                    } else {
                        res.send("Incorrect password.");
                    }
                });
            } else {
                res.send("No user found.");
            }
        })
        .catch(function(err) {
            console.log(err);
            res.send("An error occurred during login.");
        });
});

// Start the server
app.listen(port, () => {
    console.log(`The server is running on port ${port}`);
});