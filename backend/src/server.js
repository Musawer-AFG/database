import {createApp} from './app.js';
import {readPort} from './config/env.js';
const port=readPort();
createApp().listen(port,()=>console.log(`Afghan Wholesale API: http://localhost:${port}/api/health`));
