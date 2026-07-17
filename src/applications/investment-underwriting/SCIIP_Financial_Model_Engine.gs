var SCIIP_FINANCIAL_MODEL_ENGINE = (function () {
  'use strict';

  function round(value, decimals) {
    var places = decimals == null ? 2 : decimals;
    var factor = Math.pow(10, places);
    return Math.round((Number(value) || 0) * factor) / factor;
  }

  function payment(rate, periods, principal) {
    if (!periods) return 0;
    if (!rate) return principal / periods;
    var compound = Math.pow(1 + rate, periods);
    return principal * rate * compound / (compound - 1);
  }

  function npv(rate, cashFlows) {
    var total = 0;
    for (var i = 0; i < cashFlows.length; i++) {
      total += Number(cashFlows[i] || 0) / Math.pow(1 + rate, i);
    }
    return total;
  }

  function irr(cashFlows) {
    var low = -0.99;
    var high = 10;
    var middle = 0;
    for (var i = 0; i < 200; i++) {
      middle = (low + high) / 2;
      var value = npv(middle, cashFlows);
      if (Math.abs(value) < 0.000001) break;
      if (value > 0) low = middle;
      else high = middle;
    }
    return middle;
  }

  function model(request) {
    request = request || {};
    var price = Number(request.purchasePrice || 0);
    var ltv = Number(request.ltvPct == null ? 65 : request.ltvPct) / 100;
    var loan = price * ltv;
    var equity = price - loan + Number(request.closingCosts || 0) + Number(request.immediateCapital || 0);
    var monthlyRate = Number(request.interestRatePct || 0) / 1200;
    var amortizationMonths = Number(request.amortizationYears || 30) * 12;
    var holdYears = Number(request.holdYears || 5);
    var monthlyDebtService = payment(monthlyRate, amortizationMonths, loan);
    var annualDebtService = monthlyDebtService * 12;
    var initialNoi = Number(request.annualNoi || 0);
    var growthRate = Number(request.noiGrowthPct || 0) / 100;
    var exitCapRate = Number(request.exitCapRatePct || 0) / 100;
    var saleCostRate = Number(request.saleCostPct || 0) / 100;
    var cashFlows = [-equity];

    for (var year = 1; year <= holdYears; year++) {
      var noi = initialNoi * Math.pow(1 + growthRate, year - 1);
      var annualCashFlow = noi - annualDebtService;
      if (year === holdYears) {
        var nextYearNoi = initialNoi * Math.pow(1 + growthRate, year);
        var grossSalePrice = exitCapRate ? nextYearNoi / exitCapRate : 0;
        var outstandingBalance;
        if (monthlyRate) {
          var elapsedMonths = year * 12;
          outstandingBalance = loan * Math.pow(1 + monthlyRate, elapsedMonths) -
            monthlyDebtService * (Math.pow(1 + monthlyRate, elapsedMonths) - 1) / monthlyRate;
        } else {
          outstandingBalance = Math.max(0, loan - monthlyDebtService * year * 12);
        }
        annualCashFlow += grossSalePrice * (1 - saleCostRate) - outstandingBalance;
      }
      cashFlows.push(annualCashFlow);
    }

    var dscr = annualDebtService ? initialNoi / annualDebtService : 0;
    var cashOnCash = equity ? (initialNoi - annualDebtService) / equity * 100 : 0;
    var discountRate = Number(request.discountRatePct || 10) / 100;
    var totalPositiveCashFlow = cashFlows.slice(1).reduce(function (sum, value) { return sum + value; }, 0);

    return {
      loanAmount: round(loan, 2),
      equityRequired: round(equity, 2),
      annualDebtService: round(annualDebtService, 2),
      dscr: round(dscr, 2),
      cashOnCashPct: round(cashOnCash, 2),
      irrPct: round(irr(cashFlows) * 100, 2),
      npv: round(npv(discountRate, cashFlows), 2),
      equityMultiple: round(equity ? totalPositiveCashFlow / equity : 0, 2),
      cashFlows: cashFlows.map(function (value) { return round(value, 2); }),
      holdYears: holdYears
    };
  }

  return { model: model, npv: npv, irr: irr };
})();
