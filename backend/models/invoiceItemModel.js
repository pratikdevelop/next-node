const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Invoice = require('./invoiceModel');
const Product = require('./productModel');

const InvoiceItem = sequelize.define('InvoiceItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, { timestamps: false });

// Define Relationships
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoice_id', onDelete: 'CASCADE' });
InvoiceItem.belongsTo(Product, { foreignKey: 'product_id', onDelete: 'CASCADE' });

module.exports = InvoiceItem;
