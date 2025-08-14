import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcryptjs'; // Importar bcrypt para hashing de contraseñas
import { findOrCreateUser } from './user'; // Importar la función findOrCreateUser desde el archivo user.ts
import { AuthUser } from './user'; // Importar el modelo User desde el archivo user.ts

// Clave secreta para firmar y verificar JWT (¡usar una clave segura en producción!)
const JWT_SECRET = process.env['JWT_SECRET'] || 'your_super_secret_key';

passport.use(new LocalStrategy({
    usernameField: 'email', // Campo para el nombre de usuario (email)
    passwordField: 'password' // Campo para la contraseña
},
async (email, password, done) => {
    try {
        // 1. Buscar usuario local por email en la base de datos.
        const user = await AuthUser.findOne({ email: email });
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
        providerName: 'google',
        providerId: profile.id,
        raw_data: profile._json, // Datos adicionales de Google
        displayName: profile._json.name,
        picture: profile._json.picture,
        emails: profile.emails as { value: string; }[],
    }, done);
}));

// Estrategia Facebook
passport.use(new FacebookStrategy({
    clientID: process.env['FACEBOOK_APP_ID'] || 'YOUR_FACEBOOK_APP_ID', // Reemplazar con tu App ID de Facebook
    clientSecret: process.env['FACEBOOK_APP_SECRET'] || 'YOUR_FACEBOOK_APP_SECRET', // Reemplazar con tu App Secret de Facebook
    callbackURL: process.env['FACEBOOK_CALLBACK_URL'] || 'http://localhost:3000/auth/facebook/callback', // URL de callback en tu backend
    /*
        id
        first_name
        last_name
        middle_name
        name
        name_format
        picture
        short_name
    */
    profileFields: ['id', 'name', 'emails', 'picture'] // Campos que solicitas a Facebook
},
async (accessToken, refreshToken, profile, done) => {
    // Aquí se llama después de que Facebook autentica al usuario.
    // 'profile' contiene la información del usuario de Facebook.
    // Buscar o crear usuario en tu base de datos.
    console.log('Perfil de Facebook:', profile);
    findOrCreateUser({
        providerName: 'facebook',
        providerId: profile.id,
        raw_data: profile._json, // Datos adicionales de Facebook
        displayName: profile._json.first_name + ' ' + profile._json.last_name,
        picture: profile._json.picture.data.url,
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
        console.log('Payload del JWT:', jwt_payload);
        const user = await AuthUser.findById(jwt_payload.id);
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

export {passport}