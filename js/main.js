
function addHeadersToAMITables(el) {
  var amiHeading = '80% AMI'
  var numHousefholdHeading = '# household persons'

  var headerHTML = '<div class="list-grid-link no-padding w-dyn-item" style="opacity: 1;"><div class="w-row smaller-text"><div class="w-col"><div>' + 
    numHousefholdHeading + '</div></div><div class="w-col"><div>' +
    amiHeading + '</div></div></div></div>'
  el.innerHTML = headerHTML + el.innerHTML
}

function formatCurrency(el) {
  var currency = numeral(el.innerText).format('$ 0,0[.]00')

  el.innerHTML = currency
}

function setupPage() {
  var amiTablesDOMNodes = document.querySelectorAll('.ami-table')
  Array.prototype.forEach.call(amiTablesDOMNodes, addHeadersToAMITables)

  var currencyNumeral = document.querySelectorAll('.currency-numeral')
  Array.prototype.forEach.call(currencyNumeral, formatCurrency)

}

setupPage()