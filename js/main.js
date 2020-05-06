
function addHeadersToAMITables(el) {
  var annualHeading = 'Annual income'
  var numHousefholdHeading = 'Household size'
  var monthlyHeading = 'Monthly income'

  var headerHTML = '<div class="list-grid-link w-dyn-item" style="opacity: 1;"><div class="w-row smaller-text column-header">' +
      '<div class="w-col">' + numHousefholdHeading + '</div>' +
      '<div class="w-col">' + monthlyHeading + '</div>' +
      '<div class="w-col">' + annualHeading + '</div>' +
    '</div></div>'
  el.innerHTML = headerHTML + el.innerHTML
}

function formatCurrency(el) {
  var currency = numeral(el.innerText).format('$ 0,0[.]00')

  el.innerHTML = currency
}

function addMonthlyColumn(el) {
  var annualNode = el.children[1]
  var monthlyNode = annualNode.cloneNode()
  var annualIncome = annualNode.innerText * 1
  monthlyNode.innerHTML = '<div class="currency-numeral">' + Math.floor(annualIncome / 12) + '</div>'

  el.children[2].remove()
  el.insertBefore(monthlyNode, annualNode)
}

function setupMonthly(el) {
  var rows = el.querySelectorAll('.w-row:not(.column-header)')
  Array.prototype.forEach.call(rows, addMonthlyColumn)
}

function setupPage() {
  var amiTablesDOMNodes = document.querySelectorAll('.ami-table')
  Array.prototype.forEach.call(amiTablesDOMNodes, setupMonthly)
  Array.prototype.forEach.call(amiTablesDOMNodes, addHeadersToAMITables)

  var currencyNumeral = document.querySelectorAll('.currency-numeral')
  Array.prototype.forEach.call(currencyNumeral, formatCurrency)

}

setupPage()