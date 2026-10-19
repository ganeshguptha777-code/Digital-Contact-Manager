const mongoose = require('mongoose');
const dns = require('dns');

// On Windows, local ISP DNS often fails to resolve SRV records for mongodb+srv
// Setting public DNS servers ensures reliable SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if not permitted
}

const connectDB = async (customUri) => {
  const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/contact_manager';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ MONGODB CONNECTION ERROR:');
    console.error(error.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Ensure MongoDB service or daemon is running locally:');
    console.error('   e.g. "mongod" or start the Windows MongoDB Service.');
    console.error('2. Or set MONGODB_URI in server/.env to a valid MongoDB Atlas connection string:');
    console.error('   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/contact_manager');
    console.error('========================================\n');
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[MongoDB] Connection closed.');
  } catch (error) {
    console.error('[MongoDB] Error closing connection:', error.message);
  }
};

module.exports = { connectDB, disconnectDB };
