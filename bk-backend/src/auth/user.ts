import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs'; // Importar bcrypt para hashing de contraseñas

// --- Interfaces y Modelos de Mongoose ---
// Definir la interfaz para el documento de usuario
interface IAuthProvider extends Document {
  userId: string
  providerName: string; // Nombre del proveedor (ej. 'google', 'facebook', 'local')
  picture: string
  data: object; // Datos adicionales del proveedor (ej. perfil de Google)
}

const AuthProviderSchema: Schema = new Schema({
  userId: { type: String, required: true }, // ID del usuario (referencia al modelo de usuario)
  providerName: { type: String, required: true }, // Nombre del proveedor (ej. 'google', 'facebook', 'local')
  picture: { type: String }, // URL de la imagen de perfil (opcional)
  data: { type: Object }, // Datos adicionales del proveedor (ej. perfil de Google)
},
{
  strict: false, // Permitir campos adicionales
});
const AuthProvider = mongoose.model<IAuthProvider>('AuthProvider', AuthProviderSchema);


interface IAuthUser extends Document {
  email?: string; // Opcional para usuarios sociales sin email público
  password?: string; // Solo para usuarios locales (almacenar hash)
  displayName?: string; // Nombre para mostrar (opcional)
  celular?: string; // Solo para usuarios locales
  email_verified?: boolean; // Solo para usuarios locales
  wapp_verified?: boolean; // Solo para usuarios locales
  picture?: string; // URL de la imagen de perfil (opcional)
  providers?: mongoose.Types.ObjectId[]; // Array de referencias a proveedores
  roles?: string[]; // Array de roles del usuario
  // Puedes añadir más campos según necesites (ej. foto de perfil, etc.)
}

// Definir el esquema de usuario
const AuthUserSchema: Schema = new Schema({
  email: { type: String, unique: true, sparse: true }, // Email único, sparse permite múltiples nulos
  password: { type: String }, // Almacenaremos el hash aquí
  displayName: { type: String }, // Nombre para mostrar (opcional)
  celular: { type: String },
  email_verified: { type: Boolean, default: false }, // Solo para usuarios locales
  wapp_verified: { type: Boolean, default: false }, // Solo para usuarios locales
  picture: { type: String }, // URL de la imagen de perfil (opcional)
  providers: [{type: Schema.Types.ObjectId, ref: 'AuthProvider'}], // Array de proveedores para soportar múltiples
  roles: { type: [String], default: ['cliente'] }, // Array de roles del usuario
},
{
  strict: false, // Permitir campos adicionales
});
  
// Crear el modelo de usuario
const AuthUser = mongoose.model<IAuthUser>('AuthUser', AuthUserSchema);

// --- Funciones de Ayuda ---
// Función para encontrar o crear usuario en la base de datos
const findOrCreateUser = async (profile: 
  { 
    providerName?: string, 
    providerId?: string, 
    displayName?: string, 
    emails?: { value: string }[], 
    password?: string, 
    celular?: string,
    picture?: string,
    raw_data?: object, 
  }, done: (err: any, user?: IAuthUser | false) => void): Promise<void> => {

  try {
    let user: IAuthUser | null = null;
    let authProvider: IAuthProvider | null = null;


    // Buscar usuario según el proveedor
    if (profile.emails && profile.emails.length > 0){
      user = await AuthUser.findOne({ email: profile.emails[0].value });
    }

    let ID = user?.id || new mongoose.Types.ObjectId();

    if (profile.providerName !== 'local' && profile.providerId) {
      const setData = { userId: ID, providerName: profile.providerName, picture: profile.picture, data: profile.raw_data };
      authProvider = await AuthProvider.findOneAndUpdate(
          { userId: setData.userId, providerName: profile.providerName}, 
          { $set: setData },
          { upsert: true, new: true }
      );
      if ( user && authProvider) {
        const providerId = authProvider._id as mongoose.Types.ObjectId;
        user.email_verified = true;
        user.picture = profile.picture || authProvider.picture;
        if (!user.providers) user.providers = [];
        user.providers.includes(providerId) || user.providers.push(providerId);
        await user.save();
      }
    }
    

    console.log('AuthProvider:', authProvider)
/*
        if (profile.provider === 'local' && profile.emails && profile.emails.length > 0) {
            user = await User.findOne({ provider: 'local', email: profile.emails[0].value });
        } else if (profile.provider === 'google' && profile.id) {
            user = await User.findOne({$or: [{ provider: 'google', googleId: profile.id }, { email: profile.emails[0].value }]});
        } else if (profile.provider === 'facebook' && profile.id) {
            user = await User.findOne({ provider: 'facebook', facebookId: profile.id });
        }
*/
    if (user) {
      console.log('Usuario encontrado:', user.email);
      return done(null, user); // Usuario encontrado
    } else {
      // Crear nuevo usuario
      console.log('Creando nuevo usuario para proveedor:', profile.providerName);
      const newUser = new AuthUser({
        _id: ID,
        email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : undefined,
        displayName: profile.displayName,
        email_verified: authProvider ? true : false,
        picture: profile.picture,
        celular: profile.celular,
        providers: authProvider ? [authProvider] : [],
      });
      // Para usuarios locales, hashear la contraseña antes de guardar
      if (profile.providerName === 'local' && profile.password) {
        // En producción, usa un factor de costo más alto (ej. 10 o 12)
        const saltRounds = 10;
        newUser.password = await bcrypt.hash(profile.password, saltRounds);
      }
      await newUser.save(); // Guardar el nuevo usuario en la base de datos
      return done(null, newUser);
    }
  } catch (err) {
    console.error('Error en findOrCreateUser:', err);
    return done(err);
  }
};

export { AuthUser, IAuthUser, AuthProvider, IAuthProvider, findOrCreateUser };