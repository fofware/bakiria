import { config } from "dotenv";

config();

export default {
  jwtSecret: process.env.JWT_SECRET || 'mysupersecrettoken',
  jwtExpiration: parseInt(process.env.JWT_EXPIRATION || '60'),
  jwtExpirationRefresh: parseInt(process.env.JWT_REFRESH_EXPIRATION || '120'),
  
  defUser:{
    email: process.env.DEFAULT_USER,
    password: process.env.DEFAULT_PASSWORD,
    roles: ['sys_admin'],
    status: true,
    group: 'admin'
  },
  mongoDB:{
    URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/bakiria',
  }
  ,public: process.env.PUBLIC_HTML
  ,app_port: process.env.APP_PORT
}
