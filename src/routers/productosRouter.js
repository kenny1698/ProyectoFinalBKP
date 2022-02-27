import { Router } from 'express';
import productosApi from '../api/productos.js'
import {usuarioActivo} from './authRouter.js'
//const moment = require('moment'); 
import jwt from '../jwt.js'
import moment from 'moment'
import multer from 'multer'

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'./images/')
    },
    filename: (req,file,cb)=>{
        //cb(null,file.fieldname + '-' + Date.now())
        cb(null,file.originalname)
    }
  })

const upload = multer({storage})

const productosRouter = Router()

productosRouter.get('/', jwt.auth,  async (req, res) => {
    let productos = await productosApi.listarAll()
    return res.render('productos', {usuarioActivo, productos})
})

productosRouter.get('/:categoria', async (req, res) => {
    const productos = await productosApi.listarCategoria(req.params.categoria)
    return res.render('tabla-productos', {productos})
})

productosRouter.post('/', upload.single('foto'), async (req, res) => {
    let fecha = moment().format("DD/MM/YYYY HH:mm:ss");
    req.body.foto = req.file.originalname
    let prodAgregado = await productosApi.guardar(req.body)
    let productos = await productosApi.listarAll()
    //res.json(productos)
    return res.render('productos', {usuarioActivo, productos})
})

productosRouter.put('/:id', async (req, res) => {
    const prodActualizado = await productosApi.actualizar(req.params.id,req.body);
    res.json(prodActualizado)
})

productosRouter.delete('/:id', async (req, res) => {
    const prodEliminado = await productosApi.borrar(req.params.id);
    res.json(prodEliminado)
})

productosRouter.delete('/', async (req, res) => {
    const prodEliminado = await productosApi.borrarAll();
    res.json(prodEliminado)
})
export { productosRouter }