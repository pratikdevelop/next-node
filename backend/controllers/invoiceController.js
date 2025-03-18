const customersModel = require('../models/customerModel');
const categoryModel = require('../models/categoryModel');
const productModel = require('../models/productModel');
const invoiceModel = require('../models/invoiceModel');
const invoiceItemModel = require('../models/invoiceItemModel');
const { Op } = require('sequelize');

const invoiceControllers = {
    /**Render Invoice Listing Page */
    getInvoiceListPage: async (req, res) => {
        try {
            const invoices = await invoiceModel.findAll({
                include: [customersModel]  // Include customer details
            });

            res.render('invoiceList', { invoices });
        } catch (err) {
            console.error(err);
            res.status(500).send({ message: 'Error loading invoices page' });
        }
    },

    /**Render Invoice Form Page */
    getInvoiceForm: async (req, res) => {
        try {
            const customers = await customersModel.findAll();
            const categories = await categoryModel.findAll();

            res.render('invoiceForm', { customers, categories });
        } catch (err) {
            console.error(err);
            res.status(500).send({ message: 'Error loading invoice form' });
        }
    },

    /**Fetch All Customers */
    getCustomers: async (req, res) => {
        try {
            const customers = await customersModel.findAll();
            return res.status(200).json({ response: customers });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error fetching customers' });
        }
    },

    /**Fetch All Categories */
    getCategories: async (req, res) => {
        try {
            const categories = await categoryModel.findAll();
            return res.status(200).json({ response: categories });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error fetching categories' });
        }
    },

    /**Fetch Products by Category ID */
    getProductsList: async (req, res) => {
        try {
            const categoryId = req.query.category_id;

            if (!categoryId) {
                return res.status(400).send({ message: 'Category ID is required' });
            }

            const products = await productModel.findAll({
                where: { category_id: categoryId }
            });

            return res.status(200).json({ response: products });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error fetching products' });
        }
    },

    /**Fetch All Invoices */
    getAllInvoices: async (req, res) => {
        try {
          // Get pagination parameters from the query string
          const { page = 1, limit = 10, search = '', category = '' } = req.query;
          const offset = (page - 1) * limit;
      
          // Build filters
          let whereConditions = {};
      
          if (search) {
            whereConditions[Op.or] = [
              { invoice_number: { [Op.like]: `%${search}%` } },
              { '$Customer.name$': { [Op.like]: `%${search}%` } },  // Filtering by customer name
              { '$Customer.address$': { [Op.like]: `%${search}%` } },  // Filtering by customer address
              { total_amount: { [Op.like]: `%${search}%` } }
            ];
          }
      
        //   if (category) {
        //     whereConditions['$Products.category_id$'] = category;  // Filtering by product category
        //   }
      
          // Fetch invoices with pagination and filters
          const invoices = await invoiceModel.findAndCountAll({
            where: whereConditions,
            include: [
              {
                model: customersModel,
                attributes: ['name', 'address']  // Include only relevant customer details
              },
              
            ],
            limit,
            offset,
          });
      
          // Calculate total pages
          const totalPages = Math.ceil(invoices.count / limit);
      
        invoices[`limit`] = limit;
        invoices[`currentItems`] = invoices.rows.length;
        invoices['currentPage'] = page
        invoices['totalPages'] = totalPages;

        // return the invoice with complete pagination options 
        return res.status(200).json({ invoices});
        } catch (err) {
          console.error(err);
          return res.status(500).send({ message: 'Error fetching invoices' });
        }
      },
      

    /**Fetch Invoice by ID */
    getInvoiceById: async (req, res) => {
        try {
            const { id } = req.params;
            const invoice = await invoiceModel.findOne({
                where: { id },
                include: [customersModel, invoiceItemModel]
            });

            if (!invoice) {
                return res.status(404).send({ message: 'Invoice not found' });
            }

            return res.status(200).json({ response: invoice });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error fetching invoice' });
        }
    },

    /**Create a New Invoice */
    createInvoice: async (req, res) => {
        try {
            const {  customer_id, total_amount, items } = req.body;

            if ( !customer_id || !total_amount || !items.length) {
                return res.status(400).send({ message: 'Missing required fields' });
            }

            // Genrate Invoice Number
            const prefix = "INV";
            const timestamp = Date.now().toString().slice(-6); 
            const randomPart = Math.floor(1000 + Math.random() * 9000);
            const invoice_number = `${prefix}-${timestamp}-${randomPart}`;

            // Create invoice
            const newInvoice = await invoiceModel.create({ invoice_number, customer_id, total_amount });

            // Create invoice items
            for (let item of items) {
                await invoiceItemModel.create({
                    invoice_id: newInvoice.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.total
                });
            }

            return res.status(201).json({ message: 'Invoice created successfully', invoice: newInvoice });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error creating invoice' });
        }
    },

    /** Delete an Invoice */
    deleteInvoice: async (req, res) => {
        try {
            const { id } = req.params;

            const invoice = await invoiceModel.findOne({ where: { id } });

            if (!invoice) {
                return res.status(404).send({ message: 'Invoice not found' });
            }

            await invoice.destroy();

            return res.status(200).json({ message: 'Invoice deleted successfully' });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error deleting invoice' });
        }
    },

    /* Invoie update with status as completed */
    invoicStatusUpdate: async(req, res) => {

        try {
            const { id } = req.params;

            const invoice = await invoiceModel.findOne({ where: { id } });

            if (!invoice) {
                return res.status(404).send({ message: 'Invoice not found' });
            }

            await invoice.update({
                status: 'Complete'

            });

            return res.status(200).json({ message: 'Invoice deleted successfully' });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error deleting invoice' });
        }

    }


};

module.exports = invoiceControllers;
