const invoiceService = require('../services/invoice.service');
const { sendSuccess } = require('../utils/response');

class InvoiceController {
  async createInvoice(req, res, next) {
    try {
      const invoice = await invoiceService.generateInvoice(req.body, req.user);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Invoice generated successfully',
        data: invoice,
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new InvoiceController();
