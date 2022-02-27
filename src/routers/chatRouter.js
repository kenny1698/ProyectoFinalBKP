import { Router } from 'express';
import config from '../config.js'
import logger from '../log4js/log4js-module.js'

const chatRouter = Router()

chatRouter.get('/', (req, res)=>{
    return res.render('chat')
  })
  
  
chatRouter.get('/:email', (req, res) => {
  const email = req.params.email
   return res.render('chat', {email})
})

export {chatRouter}