import { Router, Request, Response, RequestHandler } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IAuthUser, AuthUser, findOrCreateUser } from './user';
import dotenv from 'dotenv';
//import { passport } from './passport';
import passport from 'passport';
import { AuthProvider } from './user';

dotenv.config();
const router = Router();

const JWT_SECRET = process.env['JWT_SECRET'] || 'your_super_secret_key';
const JWT_EXPIRATION = process.env['JWT_EXPIRATION'] || '24h'; // 1 hora por defecto
const JWT_EXPIRATION_REFRESH = process.env['JWT_REFRESH_EXPIRATION'] || '720h'; // 2 horas por defecto

const genToken = (user: IAuthUser) => {
  // Genera un token JWT para el usuario
  const options: SignOptions = { expiresIn: JWT_EXPIRATION as jwt.SignOptions["expiresIn"] };
  return jwt.sign({ id: user._id }, JWT_SECRET, options);
}

// Ruta para registro local
router.get('/auth', (req, res) => {
  res.json({ message: 'API de autenticación' });
  });

router.post('/register', (async (req: Request, res: Response) => {
  const { email, password, celular, displayName } = req.body;
  if (!email || !password || !displayName) {
      return res.status(400).json({ message: 'Faltan campos requeridos (email, password, displayName).' });
  }

  try {
    // Verificar si el email ya está registrado localmente
    const existingUser = await AuthUser.findOne({ provider: 'local', email: email });
    if (existingUser) {
        return res.status(409).json({ message: 'El email ya está registrado localmente.' });
    }
    return findOrCreateUser({
        providerName: 'local',
        displayName: displayName,
        emails: [{ value: email }],
        password: password,
    }, (err, user) => {
        if (err || !user) {
            console.error('Error al registrar usuario:', err);
            return res.status(500).json({ message: 'Error al registrar usuario.' });
        }
        // Después de registrar, puedes loguearlo automáticamente y devolver un token
        //const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' }); // Token expira en 1 hora
        const token = genToken(user);
        return res.json({ token });
    });
  } catch (err) {
      console.error('Error en la ruta /api/register:', err);
      return res.status(500).json({ message: 'Error interno del servidor.' });
  }
}) as RequestHandler);


// Ruta para login local
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  // Si la autenticación local es exitosa, req.user contendrá el usuario autenticado
  // req.user es de tipo any por defecto en Express, puedes castearlo si es necesario
  const user = req.user as IAuthUser;
//  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' }); // Token expira en 1 hora
  //const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' }); // Token expira en 1 hora
  const token = genToken(user);

  res.json({ token });
});

// Rutas para autenticación con Google
router.get('/auth/providers', (req, res) => {
  // Devolver los proveedores de autenticación disponibles
  res.json([
      { name: 'google', displayName: 'Google', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' },
      { name: 'facebook', displayName: 'Facebook', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg' },
    ]);
});

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })); // session: false porque usamos JWT

router.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:4200/auth/login' }), // Redirigir a login en caso de fallo
  (req, res) => {
      // Autenticación con Google exitosa, req.user contiene el usuario.
      const user = req.user as IAuthUser;
      //const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' }); // Token expira en 1 hora
      const token = genToken(user);
      // Redirigir al frontend, pasando el token en la URL (menos seguro, pero simple para ejemplo)
      // En producción, considera un enfoque más seguro (ej. postMessage, o una página intermedia)
      res.redirect(`http://localhost:4200/auth/login?token=${token}`); // Reemplazar 4200 con el puerto de tu app Angular
  });

// Rutas para autenticación con Facebook
router.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email', 'public_profile'], session: false })); // session: false porque usamos JWT

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: 'http://localhost:4200/auth/login' }), // Redirigir a login en caso de fallo
  (req, res) => {
      // Autenticación con Facebook exitosa, req.user contiene el usuario.
      const user = req.user as IAuthUser;
      //const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' }); // Token expira en 1 hora
      const token = genToken(user);
      // Redirigir al frontend, pasando el token en la URL
      res.redirect(`http://localhost:4200/auth/login?token=${token}`); // Reemplazar 4200 con el puerto de tu app Angular
  });

// Ruta protegida para obtener el perfil del usuario
router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // Si la autenticación JWT es exitosa, req.user contendrá el usuario autenticado
  const user = req.user as IAuthUser; // Asegúrate de que req.user sea del tipo IAuthUser

  const userProfile = user; // Eliminar la contraseña del perfil
  userProfile.password = undefined; // Asegúrate de que la contraseña no se envíe al cliente
  if ( !userProfile.picture ){
    // Si el usuario no tiene foto, buscar en authProvider
    const provider = await AuthProvider.findOne({ userId: user._id });
    if ( provider && provider.data && provider.picture ) {
      // Si existe un proveedor y tiene datos, asignar la foto
      userProfile.picture = provider.picture;
    }
  }
  console.log('Perfil de usuario:', userProfile);
  res.json(userProfile);
});

router.get('/logged', 
  passport.authenticate('jwt', { session: false }), 
  (req, res) => {
  // Verificar si el usuario está autenticado
    if (req.isAuthenticated()) {
      // Si está autenticado, devolver el perfil del usuario
      const user = req.user as IAuthUser;
      console.log('Usuario logged:', user);
      
      res.json({ 
        displayName: user.displayName, 
        email: user.email, 
        picture: user.picture,
        roles: user.roles,
      });
      
      //res.json(user);
    } else {
      // Si no está autenticado, devolver un error o un mensaje
      res.status(401).json({ message: 'No autenticado' });
    }
  }
);

router.get('/check', (async (req: Request, res: Response) => {
  const { fld, data } = req.query || req.params || req.body;

  if (!data || !fld) {
    return res.status(400).json({ message: 'Faltan campos requeridos (data, fld).' });
  }

  try {
    const filter = {
      [fld as string]: data,
    };
    const user = await AuthUser.findOne( filter);
    if (user) {
      return res.status(409).json({ message: `El ${fld} ${data} existe.` });
    }
    return res.json({ message: `El ${fld} ${data} no existe.` });
  } catch (error) {
    console.error(`Error al verificar el ${fld}:`, error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
}) as RequestHandler);


export default router;