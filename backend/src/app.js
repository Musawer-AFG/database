import express from 'express';
import {checkDatabase} from './config/database.js';
import {errorHandler} from './middleware/errorHandler.js';
export function createApp(){
  const app=express();
  app.disable('x-powered-by');
  app.use(express.json({limit:'1mb'}));
  app.get('/api/health',(req,res)=>res.json({status:'ok',service:'afghan-wholesale-api'}));
  app.get('/api/ready',async(req,res)=>{
    try { const ok=await checkDatabase();res.status(ok?200:503).json({database:ok?'ready':'unavailable'}); }
    catch {res.status(503).json({database:'unavailable'});}
  });
  // IMPORTANT: Business data routes intentionally not registered until server
  // auth, input validation, and accounting transaction rules are implemented.
  app.use('/api',(req,res)=>res.status(404).json({error:'API endpoint not implemented'}));
  app.use(errorHandler);
  return app;
}
