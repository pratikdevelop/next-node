
const { Sequelize } = require('sequelize');

// Initialize Sequelize with MySQL database
const sequelize = new Sequelize('invoiceapp', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, // Disable logging SQL queries in console
});

// Connect to database
sequelize.authenticate()
  .then(() => console.log('✅ Connected to MySQL using Sequelize'))
  .catch(err => console.error('❌ Database connection failed:', err));

module.exports = sequelize;
