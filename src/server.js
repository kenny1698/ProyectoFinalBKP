/*
artillery quick --count 50 -n 20 http://localhost:8080/api/productos > result_cluster.txt
artillery quick --count 50 -n 20 http://localhost:8080/api/productos > result_fork.txt

*/
import express from 'express'

import { Server as HttpServer } from 'http'
import { Server as Socket } from 'socket.io'

import { productosRouter } from './routers/productosRouter.js'
import { carritosRouter } from './routers/carritosRouter.js'
import { infoRouter } from './routers/infoRouter.js'
import { authRouter } from './routers/authRouter.js'
import { chatRouter } from './routers/chatRouter.js'
import addMensajesHandlers from './routers/ws/mensajes.js'

import { engine  } from 'express-handlebars'
import Handlebars from 'handlebars'
// import passport  from'passport'
// import passportLocal from 'passport-local'
import jwt from './jwt.js'
import logger from './log4js/log4js-module.js'
import flash from 'connect-flash'
//import User from './modelos/User.js'
import {allowInsecurePrototypeAccess} from '@handlebars/allow-prototype-access'

import path from 'path';
import {fileURLToPath} from 'url';

import session from 'express-session'

import config from './config.js'



function createServer() {

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)



// const mailOptions = {
//   from: 'Servidor Node.js',
//   to: config.TEST_MAIL,
//   subject: 'Nuevo Registro',
//   html: JSON.stringify(usuarioActivo)
// }



// const LocalStrategy = passportLocal.Strategy;
const secretmongo = 'shhhhhhhhhhhhhhhhhhhhh'

const app = express()
const httpServer = new HttpServer(app)
const io = new Socket(httpServer)

//--------------------------------------------
// configuro el socket

io.on('connection', async socket => {
     console.log('Nuevo cliente conectado!')
     addMensajesHandlers(socket, io.sockets)
})

app.use(session({ secret: secretmongo , 
    resave: false, 
    saveUninitialized:false, 
    cookie: { maxAge: 600000 }}))

// app.use(passport.initialize())
// app.use(passport.session())
app.use(flash())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// app.engine('handlebars', engine());
// app.set('view engine', 'handlebars');
// app.set('views', './public/views');
app.use(express.static(path.join(process.cwd(), './public')))

app.engine(
    "hbs",
    engine({
        extname: ".hbs",
        defaultLayout: "index.hbs",
        layoutsDir:  "./public/views/layouts",
        partialsDir:  "./public/views/partials",
        handlebars: allowInsecurePrototypeAccess(Handlebars),
        helpers: {
          toJSON : function(object) {
            return JSON.stringify(object)
          }
        }
    })
)

app.set('view engine', 'hbs')
app.set('views', './public/views')

app.use(express.static('images'));

app.use('/productos', productosRouter)
app.use('/carritos', carritosRouter)
app.use(authRouter)
app.use(infoRouter)
app.use('/chat', chatRouter)

app.use('*', (req, res) => {
  res.render('error',{
    error: `${req.method} ${req.originalUrl}`,
    detalle: `ruta inexistente!`
  })
  //next()
})

return {
  listen: port => new Promise((resolve, reject) => {
      const connectedServer = httpServer.listen(port, () => {
          resolve(connectedServer)
      })
      connectedServer.on('error', error => {
          reject(error)
      })
  })
}

}

export { createServer }

//export default app 



