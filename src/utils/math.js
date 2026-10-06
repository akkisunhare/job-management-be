const BigNumber = require('bignumber.js');

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_HALF_UP, DECIMAL_PLACES: 2 });

function calculatePartTotal(unitPrice, quantity) {
  const price = new BigNumber(unitPrice);
  const qty = new BigNumber(quantity);
  return price.times(qty).toFixed(2);
}

function calculateInvoiceTotals({ partsTotal, serviceCost, cleaningCost, gstRate = 10 }) {
  const parts = new BigNumber(partsTotal || 0);
  const service = new BigNumber(serviceCost || 0);
  const cleaning = new BigNumber(cleaningCost || 0);
  const gstRateVal = new BigNumber(gstRate);

  const subtotal = parts.plus(service).plus(cleaning);
  const gstAmount = subtotal.times(gstRateVal.dividedBy(100));
  const finalTotal = subtotal.plus(gstAmount);

  return {
    partsTotal: parts.toFixed(2),
    serviceCost: service.toFixed(2),
    cleaningCost: cleaning.toFixed(2),
    subtotal: subtotal.toFixed(2),
    gstRate: gstRateVal.toFixed(2),
    gstAmount: gstAmount.toFixed(2),
    finalTotal: finalTotal.toFixed(2),
  };
}

module.exports = {
  calculatePartTotal,
  calculateInvoiceTotals,
};
