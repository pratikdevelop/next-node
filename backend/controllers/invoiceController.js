'use strict';

const { Op } = require('sequelize');
const db = require('../models/index'); // Import the db object from models/index.js

const invoiceControllers = {
  /** Render Invoice Listing Page */
  getInvoiceListPage:  (req, res) => {
      res.render('invoiceList');
  },

  /** Render Invoice Form Page */
  getInvoiceForm: async (req, res) => {
    try {
      const [customers, categories] = await Promise.all([
        db.Customer.findAll({ attributes: ['id', 'name'] }),
        db.Category.findAll({ attributes: ['id', 'name'] }),
      ]);

      res.render('invoiceForm', { customers, categories });
    } catch (err) {
      console.error('Error loading invoice form:', err);
      res.status(500).json({ message: 'Error loading invoice form' });
    }
  },

  /** Fetch All Customers */
  getCustomers: async (req, res) => {
    try {
      const customers = await db.Customer.findAll();
      return res.status(200).json({ response: customers });
    } catch (err) {
      console.error('Error fetching customers:', err);
      return res.status(500).json({ message: 'Error fetching customers' });
    }
  },

  /** Fetch All Categories */
  getCategories: async (req, res) => {
    try {
      const categories = await db.Category.findAll();
      return res.status(200).json({ response: categories });
    } catch (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ message: 'Error fetching categories' });
    }
  },

  /** Fetch Products by Category ID */
  getProductsList: async (req, res) => {
    try {
      const { category_id } = req.query;

      if (!category_id) {
        return res.status(400).json({ message: 'Category ID is required' });
      }

      const products = await db.Product.findAll({
        where: { category_id },
        attributes: ['id', 'name', 'price', 'stock', 'sku'],
      });

      return res.status(200).json({ response: products });
    } catch (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ message: 'Error fetching products' });
    }
  },

  /** Fetch All Invoices with Pagination and Filters */
  getAllInvoices: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '', category = '' } = req.query;
      const offset = (page - 1) * limit;

      // Build filters
      let whereConditions = {};

      if (search) {
        whereConditions[Op.or] = [
          { invoice_number: { [Op.like]: `%${search}%` } },
          { '$Customer.name$': { [Op.like]: `%${search}%` } },
          { '$Customer.address$': { [Op.like]: `%${search}%` } },
          { total_amount: { [Op.like]: `%${search}%` } }
        ];
      }

      if (category && !isNaN(category)) {
        const invoiceIds = await db.InvoiceItem.findAll({
          attributes: ['invoice_id'],
          include: [{
            model: db.Product,
            where: { category_id: parseInt(category) },
            attributes: [],
          }],
          group: ['invoice_id'], 
        });
        whereConditions.id = { [Op.in]: invoiceIds.map(item => item.invoice_id) };
      }

      // Fetch invoices with pagination and filters
      const invoices = await db.Invoice.findAndCountAll({
        where: whereConditions,
        include: [{
          model: db.Customer,
          attributes: ['id', 'name', 'address'],
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const totalPages = Math.ceil(invoices.count / limit);

      return res.status(200).json({
        invoices: invoices.rows,
        pagination: {
          limit: parseInt(limit),
          currentItems: invoices.rows.length,
          currentPage: parseInt(page),
          totalPages,
          count: invoices.count,
        },
      });
    } catch (err) {
      console.error('Error fetching invoices:', err);
      return res.status(500).json({ message: 'Error fetching invoices' });
    }
  },

  /** Fetch Invoice by ID */
  getInvoiceById: async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await db.Invoice.findOne({
        where: { id },
        include: [
          { model: db.Customer, attributes: ['id', 'name', 'address'] },
          { model: db.InvoiceItem, include: [{ model: db.Product }] },
        ],
      });

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      return res.status(200).json({ response: invoice });
    } catch (err) {
      console.error('Error fetching invoice by ID:', err);
      return res.status(500).json({ message: 'Error fetching invoice' });
    }
  },

  /** Create a New Invoice */
  createInvoice: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { customer_id, total_amount, items } = req.body;

      if (!customer_id || !total_amount || !items?.length) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Missing required fields: customer_id, total_amount, and items are required' });
      }

      // Generate Invoice Number
      const prefix = 'INV';
      const timestamp = Date.now().toString().slice(-6);
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const invoice_number = `${prefix}-${timestamp}-${randomPart}`;

      // Create invoice
      const newInvoice = await db.Invoice.create(
        { invoice_number, customer_id, total_amount },
        { transaction }
      );

      // Create invoice items
      const invoiceItems = items.map(item => ({
        invoice_id: newInvoice.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      }));
      await db.InvoiceItem.bulkCreate(invoiceItems, { transaction });

      await transaction.commit();
      return res.status(201).json({ message: 'Invoice created successfully', invoice: newInvoice });
    } catch (err) {
      await transaction.rollback();
      console.error('Error creating invoice:', err);
      return res.status(500).json({ message: 'Error creating invoice' });
    }
  },

  /** Delete an Invoice */
  deleteInvoice: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.params;

      const invoice = await db.Invoice.findOne({ where: { id } });
      if (!invoice) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Invoice not found' });
      }

      await db.InvoiceItem.destroy({ where: { invoice_id: id }, transaction }); // Delete associated items
      await invoice.destroy({ transaction });

      await transaction.commit();
      return res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (err) {
      await transaction.rollback();
      console.error('Error deleting invoice:', err);
      return res.status(500).json({ message: 'Error deleting invoice' });
    }
  },

  /** Update Invoice Status to Complete */
  invoiceStatusUpdate: async (req, res) => {
    try {
      const { id } = req.params;

      const invoice = await db.Invoice.findOne({ where: { id } });
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      await invoice.update({ status: 'Complete' });

      return res.status(200).json({ message: 'Invoice status updated to Complete' }); // Fixed message
    } catch (err) {
      console.error('Error updating invoice status:', err);
      return res.status(500).json({ message: 'Error updating invoice status' });
    }
  },
};

module.exports = invoiceControllers;