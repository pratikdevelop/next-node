const express = require('express');
const router = express.Router();
const invoiceControllers = require('../controllers/invoiceController');

// **Render Pages**
router.get('/', invoiceControllers.getInvoiceListPage); //  Invoice listing page
router.get('/add-invoice', invoiceControllers.getInvoiceForm); //  Invoice form page

// **API Endpoints**
router.get('/api/invoices', invoiceControllers.getAllInvoices);
router.get('/api/invoices/:id', invoiceControllers.getInvoiceById);
router.post('/api/invoices', invoiceControllers.createInvoice);
router.delete('/api/invoices/:id', invoiceControllers.deleteInvoice);
router.patch('/api/invoices/:id', invoiceControllers.invoicStatusUpdate)

router.get('/api/customers', invoiceControllers.getCustomers);
router.get('/api/categories', invoiceControllers.getCategories);
router.get('/api/products', invoiceControllers.getProductsList);

module.exports = router;
