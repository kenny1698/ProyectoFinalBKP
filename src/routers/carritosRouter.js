import { Router } from 'express'
import carritosApi from '../api/carritos.js'
//import { productosApi } from '../daos/productos/index.js'
import productosApi from '../api/productos.js'
import config from '../config.js'
import {usuarioActivo} from './authRouter.js'
import { createTransport } from 'nodemailer'
//import twilio from 'twilio'
import logger from '../log4js/log4js-module.js'
import jwt from '../jwt.js'
import moment from 'moment'
import { uid } from 'uid'
import ordenesApi from '../api/ordenes.js'
import ordenes from '../modelos/Ordenes.js'

//const client = twilio(config.accountSid, config.authToken)

const transporter = createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: config.TEST_MAIL,
        pass: config.PASS_MAIL
    }
  })

const carritosRouter = Router()

carritosRouter.get('/',jwt.auth, async (req, res) => {
    let carritos = await carritosApi.listarAll()
    return res.render('carritos', {usuarioActivo, carritos})
    //res.json(carritos)
})

carritosRouter.get('/:id', async (req, res) => {
    const carritos = await carritosApi.listar(req.params.id);
    res.json(carritos)
})

carritosRouter.post('/', async (req, res) => {
    let Newordenes = new ordenes()
    let fecha = moment().format("DD/MM/YYYY HH:mm:ss")
    req.body.fecha = fecha
    const carAgregado = await carritosApi.guardar(req.body)
    let producto = await productosApi.listarNombre(req.body.producto)
    producto = producto[0]
    const mensajeHtml = JSON.stringify(producto)
    const mensaje = 'Nuevo Pedido '+ usuarioActivo.email+ " " +usuarioActivo.username+ " " +JSON.stringify(producto)
    try {
        const info =  transporter.sendMail({
          from: 'Servidor Node.js',
          to: config.TEST_MAIL,
          subject: 'Nuevo Pedido ' + usuarioActivo.username + " " + usuarioActivo.email,
          html: mensajeHtml
        })
      } catch (error) {
        logger.error(error)
      }

      Newordenes.producto = producto.nombre
      Newordenes.descripcion = producto.descripcion
      Newordenes.precio = producto.precio
      Newordenes.cantidad = req.body.cantidad
      Newordenes.numorden = uid()
      Newordenes.fecha = fecha
      Newordenes.estado = 'generada'
      Newordenes.email = req.body.email

    
      const guardarOrden = await ordenesApi.guardar(Newordenes)
    // try {
    //     const message = await client.messages.create({
    //         body: mensaje,
    //         from: 'whatsapp:+14155238886',
    //         to: `whatsapp:${usuarioActivo.telefono}`
    //     })
    //     } catch (error) {
    //         logger.error(error)
    //     }

    // const from = '+12172900665' 
    // const to =  usuarioActivo.telefono.replace("+549", "+54");
    // const body = 'Su pedido ha sido recibido y se encuentra en proceso'
    // const sms = await client.messages.create({ body , from, to })

    //res.json(carAgregado)
    let carritos = carritosApi.listarAll()
    return res.render('carritos', {usuarioActivo, carritos})
})

carritosRouter.put('/:id', async (req, res) => {
    const carActualizado = await carritosApi.actualizar(req.body);
    res.json(carActualizado)
})

carritosRouter.delete('/:id', async (req, res) => {
    const carEliminado = await carritosApi.borrar(req.params.id);
    res.json(carEliminado)
})

export { carritosRouter }