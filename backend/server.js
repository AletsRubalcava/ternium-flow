const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.use(cors({
    origin: 'http://127.0.0.1:5500'
}));

const saltRounds = 12;
const JWT_SECRET = 'clave_secreta_muy_larga_y_segura'; // en producción usa una variable de entorno

// Usuarios de prueba
const usuariosPlanos = {
    admin: "ContraseSegura2026!",
    ana:   "OtraClaveSegura1!"
};
let usuarios = {};

async function inicializarUsuarios() {
    for (const [nombre, clave] of Object.entries(usuariosPlanos)) {
        usuarios[nombre] = { passwordHash: await bcrypt.hash(clave, saltRounds) };
    }
    console.log('Usuarios inicializados con hash ✓');
}

// Brute-force protection
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // ventana de 15 minutos
    max: 5,                     // máximo 5 intentos por IP
    message: { error: 'Demasiados intentos, espera 15 minutos' },
    standardHeaders: true,
    legacyHeaders: false
});

// Validadores
const validarCredenciales = [
    body('username').trim().notEmpty().withMessage('El usuario es requerido').escape(),
    body('password')
        .trim()
        .notEmpty().withMessage('La clave es requerida')
        .isLength({ min: 10 }).withMessage('Debe tener al menos 10 caracteres')
        .matches(/[A-Z]/).withMessage('Debe contener al menos una mayúscula')
        .matches(/[a-z]/).withMessage('Debe contener al menos una minúscula')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Debe contener al menos un símbolo especial')
];

// Middleware de autenticación JWT
function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // formato: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, usuario) => {
        if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
        req.usuario = usuario;
        next();
    });
}

// LOGIN — con brute-force protection y JWT
app.post('/api/login', loginLimiter, validarCredenciales, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Datos inválidos',
            detalles: errors.array().map(e => e.msg)
        });
    }

    const { username, password } = req.body;
    const usuarioEncontrado = usuarios[username];

    const coincide = usuarioEncontrado
        ? await bcrypt.compare(password, usuarioEncontrado.passwordHash)
        : false;

    if (!coincide) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Generar token JWT que dura 2 horas
    const token = jwt.sign(
        { username },
        JWT_SECRET,
        { expiresIn: '2h' }
    );

    return res.status(200).json({ mensaje: 'Login exitoso', token });
});

// Endpoint protegido requiere token válido
app.get('/api/perfil', verificarToken, (req, res) => {
    return res.status(200).json({
        mensaje: 'Acceso autorizado',
        usuario: req.usuario.username
    });
});

// Arrancar
inicializarUsuarios().then(() => {
    app.listen(3000, () => console.log('Servidor en puerto 3000'));
});