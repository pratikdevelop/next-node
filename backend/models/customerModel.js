// const connection = require('../config/db');

// const Customer = {
//   // create table query
//   createTable: () => {
//     const sql = `
//       CREATE TABLE IF NOT EXISTS customers (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         phone VARCHAR(20) NOT NULL,
//         address TEXT NOT NULL,
//         city VARCHAR(100) NOT NULL,
//         state VARCHAR(100) NOT NULL
//       )`;
//     connection.query(sql, err => {
//       if (err) console.error("Error creating customers table:", err);
//       else console.log("✅ Customers table created.");
//     });
//   },
//   // Fetch all customers
//   fetchAll: () => {
//     const sql = "SELECT * FROM customers";
//     connection.query(sql, (err, results) => {
//       if (err) console.error("Error fetching all customers:", err);
      
      
//       else{
    
        
//         return results};
//       });
//       },
// };

// module.exports = Customer;


const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: false });

module.exports = Customer;
