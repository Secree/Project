require("dotenv").config();

// Require means export
const express = require("express")
const db = require("better-sqlite3")("pizza.db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cookieParser = require('cookie-parser')


// Pragma smooths the databse
db.pragma("journal_mode = WAL")

// Setup files
const app = express()


app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true })); // Required for form data
app.use(express.json()); // Optional (for API requests)
app.use(express.static("public"));
app.use(cookieParser())

// Database setup
const createTables = db.transaction(() => {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username STRING NOT NULL UNIQUE,
        email STRING NOT NULL UNIQUE,
        password STRING NOT NULL
        )
        `).run()

    db.prepare(`
        CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userid INTEGER,
        createdDate STRING,
        item STRING,
        price INTEGER,
        quantity INTEGER,
        image STRING,
        size STRING,
        specialInstructions STRING,
        phoneNumber STRING,
        FOREIGN KEY (userid) REFERENCES users (id)
        )
        `).run()
})

createTables()

// Middleware
app.use(function (req, res, next) {
    // Errors default to none
    res.locals.errors = []

    // Decode cookies
    try {
        const decoded = jwt.verify(req.cookies.pizzaApp, process.env.JWTSECRET)
        req.user = decoded
    } catch(err) {
        req.user = false
    }

    // Make user available globally
    res.locals.user = req.user
    console.log(req.user)
    next()
})

// Default redirect
app.get("/", (req, res) => {
    if(req.user) {
        return res.render("frontpage")
    } 
    res.render("login")

    
})

// Header open
app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/register", (req, res) => {
    res.render("login")
})

// When user login
app.post("/login", (req, res) => {
    // Errors when user try to login with unclear inputs
    let errors = []

    if(typeof req.body.username !== "string") req.body.username = ""
    if(typeof req.body.password !== "string") req.body.password = ""

    if(req.body.username.trim() == "") errors = ["Empty Username"]
    if(req.body.password == "") errors = ["Empty Password"]

    if(errors.length) {
        return res.render("login", {errors})
    } 

    // Check if username is in database
    const userInQuestionStatement = db.prepare("SELECT * FROM users WHERE USERNAME = ?")
    const userInQuestion = userInQuestionStatement.get(req.body.username)

    if(!userInQuestion) {
        errors = ["Wrong username or password"]
        return res.render("login", {errors})
    }

    // Check if password is in database. Decrypt yung registered info para malaman
    const matchPass = bcrypt.compareSync(req.body.password, userInQuestion.password)
    if(!matchPass) {
        errors = ["Wrong username or password"]
        return res.render("login", {errors})
    }

    // Bigay sa user ang cookie
    const ourTokenValue = jwt.sign({exp: Math.floor(Date.now() / 1000) + 60 * 60 *24, skycolor: 'blue', userid: userInQuestion.id, username: userInQuestion.username}, process.env.JWTSECRET)

    res.cookie("pizzaApp", ourTokenValue, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24
    }) 

    res.redirect("/")
})

app.post("/register", (req, res) => {
    // Errors when user try to login with unclear inputs
    const errors = []
    
    if(typeof req.body.username !== "string") req.body.username = ""
    if(typeof req.body.email !== "string") req.body.email = ""
    if(typeof req.body.password !== "string") req.body.password = ""

    req.body.username = req.body.username.trim()
    if(!req.body.username) errors.push("No username input")
    if(req.body.username && req.body.username.length < 3) errors.push("Username must be more than 3 characters.")
    if(req.body.username && req.body.username.length > 10) errors.push("Username must be less than 10 characters.")
    if(req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Username must be only letters and numbers.")

    // Check if username exists
    const usernameStatement = db.prepare("SELECT * FROM users WHERE username = ?")
    const usernameCheck = usernameStatement.get(req.body.username)
    if(usernameCheck) errors.push("That username is already taken")

    // Password validation
    if(!req.body.password) errors.push("No password input")
    if(req.body.password && req.body.password.length < 8) errors.push("Password must be more than 8 characters.")
    if(req.body.password && req.body.password.length > 70) errors.push("Password must be less than 70 characters.")

    // Pag may error balik sa register
    if(errors.length) {
        return res.render("login", {errors})
    } 
        
    // Save the new user in the database
    const salt = bcrypt.genSaltSync(10)
    req.body.password = bcrypt.hashSync(req.body.password, salt);

    const registerStatement = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)")
    const result = registerStatement.run(req.body.username, req.body.email, req.body.password)
    const lookupStatement = db.prepare("SELECT * FROM users WHERE ROWID = ?")
    const ourUser = lookupStatement.get(result.lastInsertRowid)

    // Log user by giving cookie
    const ourTokenValue = jwt.sign({exp: Math.floor(Date.now() / 1000) + 60 * 60 *24, skycolor: 'blue', userid: ourUser.id, username: ourUser.username}, process.env.JWTSECRET)

    res.cookie("pizzaApp", ourTokenValue, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24
    }) 

    res.redirect("/")

})

app.post("/checkout", (req, res) => {
        // Validate user is logged in
        if (!req.user) {
            return res.status(401).send("You must be logged in to checkout");
        }
    
        // Prepare the SQL statement with all columns
        const putInCart = db.prepare(`
            INSERT INTO cart (
                userid, 
                createdDate, 
                item, 
                price, 
                quantity, 
                image, 
                size, 
                specialInstructions, 
                phoneNumber
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
    
        // Get current date
        const today = new Date();
        const createdDate = today.toISOString().split('T')[0];
    
        // Destructure all required fields from request body
        const { 
            item, 
            price, 
            quantity, 
            image, 
            size, 
            specialInstructions, 
            phoneNumber 
        } = req.body;
    
        // Validate required fields
        if (!item || !price || !quantity || !image || !size || !phoneNumber) {
            return res.status(400).send("Missing required fields");
        }
    
        try {
            // Execute the insert with all parameters
            const insertCart = putInCart.run(
                req.user.userid,        // userid from logged in user
                createdDate,            // current date
                item,                  // item name
                price,                  // item price
                quantity,               // quantity
                image,                  // image URL
                size,                  // pizza size
                specialInstructions || "", // optional field
                phoneNumber             // phone number
            );
    
            console.log("Item added to cart with ID:", insertCart.lastInsertRowid);
            res.render("checkout", { success: true });
        } catch (err) {
            console.error("Database error:", err);
            res.status(500).send("Error processing your order");
        }
    })


// When loggoing out cleare cookies and redirect to homepage
app.get("/logout", (req, res) => {
    res.clearCookie("pizzaApp")
    res.redirect("/")
})

// Open at localhost:3000
app.listen(3000)
