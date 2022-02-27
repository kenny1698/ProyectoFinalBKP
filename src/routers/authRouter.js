import { Router } from 'express'
import config from '../config.js'
import logger from '../log4js/log4js-module.js'
import jwt from '../jwt.js'
import multer from 'multer'
import usuarios from '../modelos/Usuarios.js'

import {
  createHash,
  isValidPassword
} from '../utils.js'

import { createTransport } from 'nodemailer'

const storage = multer.diskStorage({
  destination: (req,file,cb)=>{
      cb(null,'./images/')
  },
  filename: (req,file,cb)=>{
      //cb(null,file.fieldname + '-' + Date.now())
      cb(null,file.originalname)
  }
})

const transporter = createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: config.TEST_MAIL,
      pass: config.PASS_MAIL
  }
})

const upload = multer({storage})

const authRouter = Router()
let usuario = ''
let usuarioActivo = ''
let access_token = ''

authRouter.get('/', (req, res) => {
  if (access_token == '')
    return res.render('login')
  else
    return res.render('home')
  })

authRouter.get('/faillogin', (req, res) => {
    return res.render('faillogin', { message: req.flash('error') })
  })

authRouter.get('/failregister', (req, res) => {
    return res.render('failregister', { message: req.flash('error') })
  })
  
authRouter.post('/login', (req, res) => {
    const usuario = req.body.nombre

    usuarios.findOne({ email : usuario })
    .then(user => {
      usuarioActivo = user
      })

    access_token = jwt.generateAuthToken(usuario)   
    //req.headers["authorization"] = `Bearer `+ access_token
    //req.headers.authorization = `Bearer `+ access_token
    res.json({
      usuario,
        access_token
    })
    
    // try {
    //   return res.render('home')
    // } catch (error) {
    //   logger.error(err)
    //   return res.render('faillogin')
    // }
    
  })

authRouter.get('/register', (req, res) => {
    return res.render('register')
  })

authRouter.get('/home',jwt.auth ,(req, res) => {
  //res.send("ENTRO /home")
   return res.render('home')
  })

  
  
authRouter.post('/register',upload.single('avatar'), (req, res) => {
        usuario = req.body.nombre
        usuarios.findOne({ email : req.body.email })
        .then(user => {
          usuarioActivo = user
          if (user) {
            return res.render('failregister', { message: 'El usuario de usuario ya existe' })
          }
          let newUser = new usuarios()
          newUser.password = createHash(req.body.password)
          newUser.username = req.body.username
          newUser.email = req.body.email
          newUser.direccion = req.body.direccion
          newUser.edad = req.body.edad
          newUser.telefono = req.body.telefono
          newUser.avatar = req.file.originalname
          newUser.save()
          //usuarioActivo = newUser
          const nombre = usuario
          access_token = jwt.generateAuthToken(nombre)
          //res.json({ access_token })
          usuarioActivo = usuario
          try {
            const info =  transporter.sendMail({
              from: 'Servidor Node.js',
              to: config.TEST_MAIL,
              subject: 'Nuevo Registro',
              html: JSON.stringify(newUser)
            })
          } catch (error) {
            logger.error(error)
          }
         
          return res.render('/')
        })
  })

authRouter.get('/info',jwt.auth, (req, res) => {
    usuarios.findOne({ email : usuarioActivo })
    .then(user => {
      usuario = user
      })
    return res.render('info', {usuario, usuarioActivo})
  })

authRouter.post('/logout', (req, res) => {
    access_token = '' 
    req.session.destroy(err => {
        if (!err) //res.send('Logout ok!') 
        res.render('logout', {usuario}) 
        else res.send({ status: 'Logout ERROR', body: err })
    })
      
})

export {authRouter, usuarioActivo, access_token}