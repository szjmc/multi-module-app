const { testConnection, initDatabase, query } = require('./db');

async function checkTable() {
  try {
    console.log('Testing database connection...');
    await testConnection();
    console.log('Database connection successful');
    
    console.log('Initializing database tables...');
    await initDatabase();
    console.log('Database tables initialized');
    
    console.log('Checking notes table structure...');
    const result = await query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'notes\' ORDER BY ordinal_position');
    console.log('Notes table columns:');
    result.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTable();