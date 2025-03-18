const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Customer = require('./customerModel');

const Invoice = sequelize.define('Invoice', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  invoice_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { 
    type: DataTypes.ENUM('Pending', 'Complete'), 
    defaultValue: 'Pending' 
  },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { timestamps: false });

Invoice.belongsTo(Customer, { foreignKey: 'customer_id', onDelete: 'CASCADE' });

module.exports = Invoice;
