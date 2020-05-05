
function addHeadersToAMITables(el) {
  var headerHTML = '<div class="list-grid-link no-padding w-dyn-item" style="opacity: 1;"><div class="w-row"><div class="w-col w-col-3"><div>Number of persons in household</div></div><div class="w-col w-col-9"><div>80% Average Median Income (Houston region)</div></div></div></div>'
  el.innerHTML = headerHTML + el.innerHTML
}

function formatCurrency(el) {
  var currency = numeral(el.innerText).format('$ 0,0[.]00')

  el.innerHTML = currency
}

function setupPage() {
  var amiTablesDOMNodes = document.querySelectorAll('.ami-table')
  Array.prototype.forEach.call(amiTablesDOMNodes, addHeadersToAMITables)

  var currencyNumeral = document.querySelectorAll('.pricing-numeral')
  Array.prototype.forEach.call(currencyNumeral, formatCurrency)

}

setupPage()