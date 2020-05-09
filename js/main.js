// JS is as IE compat as possible.  Assumes jquery is loaded.

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

  el.dataset.processed = true
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

function getHTMLForLocationCheckResponse(response) {
  if (response[0] === true) {
    return '<div class="badge bg-success">Yes</div>'
  } else if (response[0] === false) {
    return '<div class="badge bg-danger">No</div>'
  }
}

function handleLocationChecker(formControls) {
  return function(submitEvent) {
    submitEvent.preventDefault()
    submitEvent.stopPropagation()

    var place = formControls.autocomplete.getPlace()
    var locationCheckerURL = 'https://boundary-pip-beta.herokuapp.com/houston-pip?' +
      'lat=' + place.geometry.location.lat() + '&lon=' + place.geometry.location.lng()

    $.get(locationCheckerURL)
      .then(function (response) {
        var answerHTML = getHTMLForLocationCheckResponse(response)
        formControls.message.classList.add('show')
        formControls.answer.innerHTML = answerHTML
      })
  }
}

function handlePlaceChange(formControls) {
  return function (changeEvent) {
    var place = this.getPlace()
    if (!place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      // window.alert("No details available for input: '" + place.name + "'");
      return;
    }
  
    var address = ''
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ')
    }

    formControls.addressDisplay.innerText = address
    formControls.submitButton.setAttribute('disabled', false)
  }
}

function getFormEls(formEl) {
  var inputEl = formEl.querySelector('[name="address"]')
  var submitButtonEl = formEl.querySelector('[type=submit]')
  var addressDisplayEl = document.querySelector('#address-display')
  var messageEl = formEl.querySelector('#location-checker-message')
  var answerEl = formEl.querySelector('#address-checker-answer')
  
  return {
    input: inputEl,
    submitButton: submitButtonEl,
    addressDisplay: addressDisplayEl,
    message: messageEl,
    answer: answerEl
  }
}

function setupLocationChecker(formEl) {
  var formControls = getFormEls(formEl)
  var autocomplete = new google.maps.places.Autocomplete(formControls.input)
  formControls.autocomplete = autocomplete

  // CoH northwest: 30.128310, -95.826341
  // CoH southeast: 29.485913, -95.028755
  autocomplete.setBounds({
    north: 30.128310,
    east: -95.028755,
    south: 29.485913,
    west: -95.826341
  })

  autocomplete.setFields(
    ['address_components', 'geometry', 'icon', 'name'])

  formControls.submitButton.setAttribute('disabled', true)
  autocomplete.addListener('place_changed', handlePlaceChange(formControls))
  formEl.addEventListener('submit', handleLocationChecker(formControls))
}

function setupPage() {
  var amiTablesDOMNodes = document.querySelectorAll('.ami-table:not([data-processed])')
  Array.prototype.forEach.call(amiTablesDOMNodes, setupMonthly)
  Array.prototype.forEach.call(amiTablesDOMNodes, addHeadersToAMITables)

  var currencyNumeral = document.querySelectorAll('.currency-numeral')
  Array.prototype.forEach.call(currencyNumeral, formatCurrency)

  var locationCheckerForm = document.querySelector('#address-checker')
  if (locationCheckerForm) {
    setupLocationChecker(locationCheckerForm)
  }

}

setupPage()