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
  ,"web":{
    "client_id":"298333149753-2b3fs6kjq84t45jlf3l26fspr17o340q.apps.googleusercontent.com",
    "project_id":"bkauth",
    "auth_uri":"https://accounts.google.com/o/oauth2/auth",
    "token_uri":"https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs",
    "client_secret":"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",
    "redirect_uris":["http://localhost:4444/api/auth/google/callback"]
  }
}
