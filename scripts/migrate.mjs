import { readdir, readFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
const {Client}=pg;
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const url=process.env.DATABASE_URL;
if (!url) {console.error('Set DATABASE_URL before running migrations');process.exit(1);}
const client=new Client({connectionString:url});
await client.connect();
try{
 await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
 const files=(await readdir(join(root,'database','migrations'))).filter(x=>x.endsWith('.sql')).sort();
 for(const name of files){
  const applied=await client.query('SELECT 1 FROM schema_migrations WHERE name=$1',[name]);
  if(applied.rowCount){console.log('Already applied:',name);continue;}
  const sql=await readFile(join(root,'database','migrations',name),'utf8');
  await client.query('BEGIN');
  try {await client.query(sql);await client.query('INSERT INTO schema_migrations(name) VALUES($1)',[name]);await client.query('COMMIT');console.log('Applied:',name);}
  catch(error){await client.query('ROLLBACK');throw error;}
 }
}finally{await client.end();}
