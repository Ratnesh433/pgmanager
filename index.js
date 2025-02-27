import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "pgman",
    password: "123",
    port: 5432,
});
db.connect();

const port = 3000;
const app = express();
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to handle database errors
const handleDatabaseError = (error, res) => {
    console.error("Database Error:", error);
    return res.status(500).send("An error occurred while processing your request");
};

app.get("/", (req, res) => {
    res.render('login.ejs');
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await db.query("SELECT * FROM admin");
        const user = result.rows[0];
        const adminUsername = user.username;
        const adminPassword = user.password;

        if (username === adminUsername && password === adminPassword) {
            res.render("ui.ejs");
        } else {
            res.status(401).send("Incorrect username or password");
        }
    } catch (error) {
        handleDatabaseError(error, res);
    }
});

app.get("/index.ejs", (req, res) => {
    res.render("index.ejs");
});

app.get("/view.ejs", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM users ORDER BY id ASC");
        const rows = result.rows;
        res.render("view.ejs", { rows: rows });
    } catch (error) {
        handleDatabaseError(error, res);
    }
});

app.post("/submit", async (req, res) => {
    try {
        const { name, gender, phone, aadhar } = req.body;
        
        // Basic validation
        if (!name || !gender || !phone || !aadhar) {
            return res.status(400).send("All fields are required");
        }
        
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).send("Phone number must be 10 digits");
        }
        
        if (!/^\d{12}$/.test(aadhar)) {
            return res.status(400).send("Aadhar number must be 12 digits");
        }

        await db.query(
            "INSERT INTO users(name, gender, phone, aadhar) VALUES ($1, $2, $3, $4)",
            [name, gender, phone, aadhar]
        );

        // Redirect to view page after successful submission
        res.redirect("/view.ejs");
    } catch (error) {
        // Check for unique constraint violations
        if (error.code === '23505') {  // PostgreSQL unique violation code
            res.status(400).send("This Aadhar number is already registered");
        } else {
            handleDatabaseError(error, res);
        }
    }
});

app.get("/edit/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate id is a number
        if (isNaN(id)) {
            return res.status(400).send("Invalid ID");
        }

        const result = await db.query(
            "SELECT * FROM users WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("User not found");
        }

        res.render("edit.ejs", { user: result.rows[0] });
    } catch (error) {
        handleDatabaseError(error, res);
    }
});

app.post("/edit/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, gender, phone, aadhar } = req.body;

        // Basic validation
        if (!name || !gender || !phone || !aadhar) {
            return res.status(400).send("All fields are required");
        }
        
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).send("Phone number must be 10 digits");
        }
        
        if (!/^\d{12}$/.test(aadhar)) {
            return res.status(400).send("Aadhar number must be 12 digits");
        }

        const result = await db.query(
            `UPDATE users 
             SET name = $1, gender = $2, phone = $3, aadhar = $4 
             WHERE id = $5 
             RETURNING *`,
            [name, gender, phone, aadhar, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("User not found");
        }

        res.redirect("/view.ejs");
    } catch (error) {
        if (error.code === '23505') {  // PostgreSQL unique violation code
            res.status(400).send("This Aadhar number is already registered");
        } else {
            handleDatabaseError(error, res);
        }
    }
});

app.post("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Validate id is a number
        if (isNaN(id)) {
            return res.status(400).send("Invalid ID");
        }

        const result = await db.query(
            "DELETE FROM users WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("User not found");
        }

        res.redirect("/view.ejs");
    } catch (error) {
        handleDatabaseError(error, res);
    }
});
        
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
    
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});