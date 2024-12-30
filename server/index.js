const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "lure"
});

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, // Permitir cookies y credenciales
}));

app.use(express.json());
app.use(cookieParser());

const SECRET_KEY = "lure"; // clave segura

// Registro de usuario
app.post("/create", async (req, res) => {
    const { user_handle, email_address, first_name, last_name, phone_number, password } = req.body;
    console.log(req.body); // Asegúrate de que todos los datos lleguen correctamente al backend

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
            "INSERT INTO users (user_handle, email_address, first_name, last_name, phone_number, password) VALUES (?, ?, ?, ?, ?, ?)",
            [user_handle, email_address, first_name, last_name, phone_number, hashedPassword],
            (err, result) => {
                if (err) {
                    console.log("Error SQL:", err); // Log para detalles
                    res.status(500).send("Error al registrar el usuario");
                } else {
                    res.send("Usuario registrado correctamente");
                }
            }
        );
    } catch (error) {
        console.log("Error backend:", error);
        res.status(500).send("Error al registrar el usuario");
    }
});

// Login de usuario
app.post("/login", (req, res) => {
    const { user_handle, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE user_handle = ?",
        [user_handle],
        async (err, results) => {
            if (err) {
                console.log(err);
                res.status(500).send("Error en el servidor");
            } else if (results.length === 0) {
                res.status(401).send("Usuario no encontrado");
            } else {
                const user = results[0];
                const validPassword = await bcrypt.compare(password, user.password);

                if (!validPassword) {
                    res.status(401).send("Contraseña incorrecta");
                } else {
                    const token = jwt.sign(
                        { id: user.user_id, user_handle: user.user_handle },
                        SECRET_KEY,
                        { expiresIn: "1h" }
                    );

                    // Enviar el token como cookie
                    res.cookie("token", token, {
                        httpOnly: true,
                        secure: false, // Cambia a true si usas HTTPS
                        sameSite: "lax",
                    });

                    res.send("Login exitoso");
                }
            }
        }
    );
});

// Ruta protegida de ejemplo
app.get("/profile", (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send("No autorizado");
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log("Token decodificado:", decoded); // Verifica la carga útil del token
        res.send(`Bienvenido, ${decoded.user_handle}`);
    } catch (err) {
        res.status(401).send("Token inválido");
    }
});

// Logout de usuario
app.post("/logout", (req, res) => {
    // Elimina la cookie del token
    res.clearCookie("token", { path: "/" }); // Asegúrate de que el path sea el mismo que se usó para configurarla
    res.send("Logout exitoso");
});

app.listen(3001, () => {
    console.log("Server running on port 3001"); 
});
