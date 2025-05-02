import { fileURLToPath } from 'node:url';
// Este es un ejemplo conceptual de backend usando Node.js/Express con TypeScript y Mongoose (MongoDB).
// No incluye manejo completo de errores o configuración de producción avanzada.
// Requiere instalar: typescript, ts-node (para ejecutar .ts directamente), express, passport,
// passport-local, passport-google-oauth20, passport-facebook, jsonwebtoken, passport-jwt,
// body-parser, cors, mongoose, @types/express, @types/passport, @types/passport-local,
// @types/passport-google-oauth20, @types/passport-facebook, @types/jsonwebtoken,
// @types/passport-jwt, @types/cors, @types/mongoose, bcrypt (¡para hashing de contraseñas!)

import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import jwt from 'jsonwebtoken';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs'; // Importar bcrypt para hashing de contraseñas

// --- Interfaces y Modelos de Mongoose ---

// Definir la interfaz para el documento de usuario
interface IUser extends Document {
    provider: 'local' | 'google' | 'facebook';
    displayName: string;
    email?: string; // Opcional para usuarios sociales sin email público
    password?: string; // Solo para usuarios locales (almacenar hash)
    celular?: string; // Solo para usuarios locales
    googleId?: string; // Solo para usuarios de Google
    facebookId?: string; // Solo para usuarios de Facebook
    // Puedes añadir más campos según necesites (ej. foto de perfil, etc.)
}

// Definir el esquema de usuario
const UserSchema: Schema = new Schema({
    provider: { type: String, required: true, enum: ['local', 'google', 'facebook'] },
    displayName: { type: String, required: true },
    email: { type: String, unique: true, sparse: true }, // Email único, sparse permite múltiples nulos
    password: { type: String }, // Almacenaremos el hash aquí
    celular: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    facebookId: { type: String, unique: true, sparse: true },
});

// Crear el modelo de usuario
const User = mongoose.model<IUser>('User', UserSchema);

// --- Configuración de la Aplicación ---

// Importar dotenv para cargar variables de entorno desde un archivo .env
//import dotenv from 'dotenv';
//dotenv.config(); // Cargar variables de entorno desde .env
// Crear una instancia de Express
import { config } from 'dotenv';
const pepe = config({path: '.env.bk-app'});

console.log('pepe:', pepe);

const app = express();
const port = 3000;

// Clave secreta para firmar y verificar JWT (¡usar una clave segura en producción!)
const JWT_SECRET = process.env['JWT_SECRET'] || 'your_super_secret_key';

// URL de conexión a MongoDB (¡usar variables de entorno en producción!)
const MONGODB_URI = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/authdb';
console.log('Conectando a MongoDB en:', MONGODB_URI);
// --- Conexión a MongoDB ---
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// --- Configuración de Middleware ---
app.use(cors()); // Permite solicitudes desde el frontend de Angular
app.use(bodyParser.json()); // Para parsear cuerpos de solicitud JSON
app.use(passport.initialize()); // Inicializa Passport

// --- Funciones de Ayuda ---

// Función para encontrar o crear usuario en la base de datos
const findOrCreateUser = async (profile: { provider: 'local' | 'google' | 'facebook', id?: string, displayName: string, emails?: { value: string }[], password?: string, celular?: string }, done: (err: any, user?: IUser | false) => void): Promise<void> => {
    try {
        let user: IUser | null = null;

        // Buscar usuario según el proveedor
        if (profile.provider === 'local' && profile.emails && profile.emails.length > 0) {
            user = await User.findOne({ provider: 'local', email: profile.emails[0].value });
        } else if (profile.provider === 'google' && profile.id) {
            user = await User.findOne({ provider: 'google', googleId: profile.id });
        } else if (profile.provider === 'facebook' && profile.id) {
            user = await User.findOne({ provider: 'facebook', facebookId: profile.id });
        }

        if (user) {
            console.log('Usuario encontrado:', user.displayName);
            return done(null, user); // Usuario encontrado
        } else {
            // Crear nuevo usuario
            console.log('Creando nuevo usuario para proveedor:', profile.provider);
            const newUser = new User({
                provider: profile.provider,
                displayName: profile.displayName,
                email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : undefined,
                celular: profile.celular,
                googleId: profile.provider === 'google' ? profile.id : undefined,
                facebookId: profile.provider === 'facebook' ? profile.id : undefined,
            });

            // Para usuarios locales, hashear la contraseña antes de guardar
            if (profile.provider === 'local' && profile.password) {
                // En producción, usa un factor de costo más alto (ej. 10 o 12)
                const saltRounds = 10;
                newUser.password = await bcrypt.hash(profile.password, saltRounds);
            }

            await newUser.save(); // Guardar el nuevo usuario en la base de datos
            console.log('Usuario creado:', newUser.displayName);
            return done(null, newUser);
        }
    } catch (err) {
        console.error('Error en findOrCreateUser:', err);
        return done(err);
    }
};


// --- Estrategias de Passport ---

// Estrategia Local (para login con email/password)
passport.use(new LocalStrategy({
    usernameField: 'email', // Campo para el nombre de usuario (email)
    passwordField: 'password' // Campo para la contraseña
},
async (email, password, done) => {
    try {
        // 1. Buscar usuario local por email en la base de datos.
        const user = await User.findOne({ provider: 'local', email: email });

        if (!user) {
            return done(null, false, { message: 'Email incorrecto.' });
        }
        // 2. Comparar la contraseña proporcionada con el hash almacenado.
        // Asegúrate de que user.password no sea undefined antes de comparar
        if (!user.password) {
             return done(null, false, { message: 'Usuario local sin contraseña.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return done(null, false, { message: 'Contraseña incorrecta.' });
        }
        return done(null, user); // Autenticación local exitosa
    } catch (err) {
        console.error('Error en LocalStrategy:', err);
        return done(err);
    }
}));

// Estrategia Google OAuth 2.0
passport.use(new GoogleStrategy({
    clientID: process.env['GOOGLE_CLIENT_ID'] || 'YOUR_GOOGLE_CLIENT_ID', // Reemplazar con tu Client ID de Google
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'] || 'YOUR_GOOGLE_CLIENT_SECRET', // Reemplazar con tu Client Secret de Google
    callbackURL: process.env['GOOGLE_CALLBACK_URL'] || 'http://localhost:3000/auth/google/callback' // URL de callback en tu backend
},
async (accessToken, refreshToken, profile, done) => {
    // Aquí se llama después de que Google autentica al usuario.
    // 'profile' contiene la información del usuario de Google.
    // Buscar o crear usuario en tu base de datos.
    findOrCreateUser({
        provider: 'google',
        id: profile.id,
        displayName: profile.displayName,
        emails: profile.emails as { value: string }[], // Castear a tipo esperado
    }, done);
}));

// Estrategia Facebook
passport.use(new FacebookStrategy({
    clientID: process.env['FACEBOOK_APP_ID'] || 'YOUR_FACEBOOK_APP_ID', // Reemplazar con tu App ID de Facebook
    clientSecret: process.env['FACEBOOK_APP_SECRET'] || 'YOUR_FACEBOOK_APP_SECRET', // Reemplazar con tu App Secret de Facebook
    callbackURL: process.env['FACEBOOK_CALLBACK_URL'] || 'http://localhost:3000/auth/facebook/callback', // URL de callback en tu backend
    profileFields: ['id', 'displayName', 'emails'] // Campos que solicitas a Facebook
},
async (accessToken, refreshToken, profile, done) => {
    // Aquí se llama después de que Facebook autentica al usuario.
    // 'profile' contiene la información del usuario de Facebook.
    // Buscar o crear usuario en tu base de datos.
    findOrCreateUser({
        provider: 'facebook',
        id: profile.id,
        displayName: profile.displayName,
        emails: profile.emails as { value: string }[], // Castear a tipo esperado
    }, done);
}));

// Estrategia JWT (para proteger rutas)
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extraer JWT del encabezado Authorization: Bearer <token>
    secretOrKey: JWT_SECRET as string // Clave secreta para verificar la firma del JWT
};

passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
        // jwt_payload contiene el payload del token (ej. { id: userId })
        // Buscar usuario por ID en la base de datos
        const user = await User.findById(jwt_payload.id);

        if (user) {
            return done(null, user); // Usuario encontrado, autenticación exitosa
        } else {
            return done(null, false); // Usuario no encontrado
        }
    } catch (err) {
        console.error('Error en JwtStrategy:', err);
        return done(err);
    }
}));

// --- Rutas de Autenticación ---

// Ruta para registro local
app.post('/api/register', async (req, res) => {
    const { email, password, celular, displayName } = req.body;
    if (!email || !password || !displayName) {
        return res.status(400).json({ message: 'Faltan campos requeridos (email, password, displayName).' });
    }

    try {
        // Verificar si el email ya está registrado localmente
        const existingUser = await User.findOne({ provider: 'local', email: email });
        if (existingUser) {
            return res.status(409).json({ message: 'El email ya está registrado localmente.' });
        }

        return findOrCreateUser({
            provider: 'local',
            displayName: displayName,
            emails: [{ value: email }],
            password: password,
            celular: celular,
        }, (err, user) => {
            if (err || !user) {
                console.error('Error al registrar usuario:', err);
                return res.status(500).json({ message: 'Error al registrar usuario.' });
            }
            // Después de registrar, puedes loguearlo automáticamente y devolver un token
            const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' }); // Token expira en 1 hora
            return res.json({ token });
        });

    } catch (err) {
        console.error('Error en la ruta /api/register:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});


// Ruta para login local
app.post('/api/login', passport.authenticate('local', { session: false }), (req, res) => {
    // Si la autenticación local es exitosa, req.user contendrá el usuario autenticado
    // req.user es de tipo any por defecto en Express, puedes castearlo si es necesario
    const user = req.user as IUser;
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' }); // Token expira en 1 hora
    res.json({ token });
});

// Rutas para autenticación con Google
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })); // session: false porque usamos JWT

app.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:4200/login' }), // Redirigir a login en caso de fallo
    (req, res) => {
        // Autenticación con Google exitosa, req.user contiene el usuario.
        const user = req.user as IUser;
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' }); // Token expira en 1 hora
        // Redirigir al frontend, pasando el token en la URL (menos seguro, pero simple para ejemplo)
        // En producción, considera un enfoque más seguro (ej. postMessage, o una página intermedia)
        res.redirect(`http://localhost:4200/login?token=${token}`); // Reemplazar 4200 con el puerto de tu app Angular
    });

// Rutas para autenticación con Facebook
app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['email', 'public_profile'], session: false })); // session: false porque usamos JWT

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { session: false, failureRedirect: 'http://localhost:4200/login' }), // Redirigir a login en caso de fallo
    (req, res) => {
        // Autenticación con Facebook exitosa, req.user contiene el usuario.
        const user = req.user as IUser;
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' }); // Token expira en 1 hora
        // Redirigir al frontend, pasando el token en la URL
        res.redirect(`http://localhost:4200/login?token=${token}`); // Reemplazar 4200 con el puerto de tu app Angular
    });

// Ruta protegida para obtener el perfil del usuario
app.get('/api/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    // Si la autenticación JWT es exitosa, req.user contendrá el usuario autenticado
    const user = req.user as IUser;
    // ¡No enviar la contraseña hasheada en una aplicación real!
    const userProfile = {
        id: user._id, // Usar _id de MongoDB
        displayName: user.displayName,
        email: user.email,
        celular: user.celular, // Incluir celular
        provider: user.provider,
        // No incluir información sensible como contraseñas o IDs de proveedores externos directamente a menos que sea necesario y seguro.
    };
    res.json(userProfile);
});

// --- Inicio del Servidor ---
app.listen(port, () => {
    console.log(`Backend escuchando en http://localhost:${port}`);
});

// NOTA IMPORTANTE:
// Este backend es solo un ejemplo conceptual. Para una aplicación de producción, necesitarías:
// - Configuración segura de las credenciales de las APIs sociales y la clave JWT (usar variables de entorno y un archivo .env).
// - Un mecanismo más seguro para pasar el token del backend al frontend después de la autenticación social (ej. postMessage).
// - Manejo robusto de errores y validación de entrada.
// - Configuración de CORS más restrictiva en producción.
// - Implementar refresco de tokens para mejorar la seguridad y la experiencia del usuario.
// - Considerar la verificación de email para usuarios locales.
