const express = require('express');
const app = express();
const sequelize = require('./config/db'); // Import Sequelize instance
const router = require('./routes/index');

// Import Models (Sequelize automatically creates tables)
const Customer = require('./models/customerModel');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');
const Invoice = require('./models/invoiceModel');
const InvoiceItem = require('./models/invoiceItemModel'); 

// Middleware to parse request body
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Set EJS as templating engine
app.set('view engine', 'ejs');

// Set routing
app.use('/', router);

// Sync Sequelize Models & Create Tables (if not exist)
sequelize.sync({ force: false }) // Change `force: true` if you want to reset tables
  .then(() => console.log('✅ Database synced with Sequelize'))
  .catch(err => console.error('❌ Sequelize sync error:', err));

// Start Server
const PORT = 4500;
app.listen(PORT, () => {
  console.log(`🚀 Server started successfully on port ${PORT}`);
});
