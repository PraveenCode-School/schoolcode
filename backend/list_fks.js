const { pool } = require('./src/config/db');
async function run() {
  try {
    const res = await pool.query(`
      SELECT 
          tc.table_name, 
          kcu.column_name, 
          cc.table_name AS foreign_table_name, 
          cc.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu 
            ON tc.constraint_name = kcu.constraint_name 
          JOIN information_schema.constraint_column_usage AS cc 
            ON cc.constraint_name = tc.constraint_name 
      WHERE tc.constraint_type = 'FOREIGN KEY' AND cc.table_name='schools'
    `);
    console.table(res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
