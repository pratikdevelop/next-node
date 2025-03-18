// const connection = require('../config/db');

// const Category = {
//     fetchAll: () => {
//         connection.query('SELECT * FROM categories', (err, results) => {
//             if (err) {
//                 return err
//                 } else {
//                     return results;
//                     }
//                     });
//                 },

//   createTable: () => {
//     const sql = `
//       CREATE TABLE IF NOT EXISTS categories (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         created_at timestamp NULL DEFAULT NULL
//       )`;
//     connection.query(sql, err => {
//       if (err) console.error("Error creating categories table:", err);
//       else console.log("✅ Categories table created.");
//     });
//   }
// };

// module.exports = Category;


const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: null }
}, { timestamps: false });

module.exports = Category;
