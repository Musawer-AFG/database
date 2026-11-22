import pg from 'pg';
const {Pool}=pg;
let pool;
export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL has not been configured');
  pool ||= new Pool({connectionString:process.env.DATABASE_URL,max:10,connectionTimeoutMillis:5000});
  return pool;
}
export async function checkDatabase() {
  const result=await getDb().query('SELECT 1 AS ok');
  return result.rows[0]?.ok===1;
}
