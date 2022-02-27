import { Router } from 'express';
import config from '../config.js'
import logger from '../log4js/log4js-module.js'
import jwt from '../jwt.js' 

const infoRouter = Router()

infoRouter.get('/infoServer',jwt.auth, (req, res)=>{
    //res.send({specs:config.getSpecs()})
    const specs = config.getSpecs()
    return res.render('infoServer', {specs:config.getSpecs()})
  })
  

export {infoRouter}