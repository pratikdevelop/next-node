// const connection = require('../config/db');

// const Product = {
//   createTable: () => {
//     const sql = `
//       CREATE TABLE IF NOT EXISTS products (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         category_id INT,
//         price DECIMAL(10,2) NOT NULL,
//         title varchar(255) NOT NULL,
//         description text,
//         stock int NOT NULL DEFAULT '0',
//         sku varchar(255) NOT NULL,
//         created_at timestamp NULL DEFAULT NULL,
//         FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
//       )`;
//     connection.query(sql, err => {
//       if (err) console.error("Error creating products table:", err);
//       else console.log("✅ Products table created.");
//     });
//   }
// };

// module.exports = Product;


const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Category = require('./categoryModel');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  category_id: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  sku: { type: DataTypes.STRING, allowNull: false, unique: true },
  created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: null }
}, { timestamps: false });

Product.belongsTo(Category, { foreignKey: 'category_id', onDelete: 'CASCADE' });

module.exports = Product;
