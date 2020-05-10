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

function handleLocationChecker(formControls, autocomplete) {
  return function(submitEvent) {
    submitEvent.preventDefault()
    submitEvent.stopPropagation()

    if (formControls.submitButton.dataset.disabled === 'true') {
      return
    }

    formControls.submitButton.dataset.disabled = true
    formControls.submitButton.value = "Verifying..."
    var place = place = autocomplete.getPlace.call(autocomplete)
    var locationCheckerURL = 'https://boundary-pip-beta.herokuapp.com/houston-pip?' +
      'lat=' + place.geometry.location.lat() + '&lon=' + place.geometry.location.lng()

    $.get(locationCheckerURL)
      .then(function (response) {
        var answerHTML = getHTMLForLocationCheckResponse(response)
        formControls.answer.innerHTML = answerHTML
        formControls.submitButton.value = "Verified"
      })
  }
}

function renderLocationChecker(formControls, autocomplete) {
  if (formControls.state.canVerify) {
    if (formControls.submitButton.dataset.disabled === "false") {
      return
    }
    if (!formControls.message.classList.contains('show-messge')) {
      formControls.message.classList.add('show-message')
    }
    formControls.addressDisplay.innerText = formControls.input.value
    formControls.submitButton.dataset.disabled = false
    formControls.answer.innerHTML = ''
    formControls.submitButton.value = 'Verify'
  } else {
    if (formControls.addressDisplay.innerText === 'address here') {
      return
    }
    if (formControls.message.classList.contains('show-messge')) {
      formControls.message.classList.remove('show-message')
    }
    formControls.addressDisplay.innerText = 'address here'
    formControls.submitButton.dataset.disabled = true
    formControls.answer.innerHTML = ''
    formControls.submitButton.value = 'Verify'
  }
}

function updateState(formControls, autocomplete) {
  var place = autocomplete.getPlace.call(autocomplete)
  window.place = place
  window.autocomplete = autocomplete
  if (!place || !place.geometry) {
    formControls.state.canVerify = false
  } else {
    formControls.state.canVerify = true
  }
  return formControls
}

function handleInputType(formControls, autocomplete) {
  return function (changeEvent) {
    console.log('keypress')
    updateState(formControls, autocomplete)
    renderLocationChecker(formControls, autocomplete)
  }
}

function handlePlaceChange(formControls, autocomplete) {
  return function (changeEvent) {
    console.log('place change')
    updateState(formControls, autocomplete)
    renderLocationChecker(formControls, autocomplete)
  }
}

function getFormEls(formEl) {
  var inputEl = formEl.querySelector('[name="address"]')
  var submitButtonEl = formEl.querySelector('[type=submit]')
  var addressDisplayEl = document.querySelector('#address-display')
  var messageEl = document.querySelector('#location-checker-message')
  var answerEl = document.querySelector('#address-checker-answer')
  
  return {
    input: inputEl,
    submitButton: submitButtonEl,
    addressDisplay: addressDisplayEl,
    message: messageEl,
    answer: answerEl,
    state: {
      canVerify: false
    }
  }
}

function setupLocationChecker(formEl) {
  var formControls = getFormEls(formEl)
  var autocomplete = new google.maps.places.Autocomplete(formControls.input)

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

  formControls.submitButton.dataset.disabled = true
  autocomplete.addListener('place_changed', handlePlaceChange(formControls, autocomplete))
  formControls.input.addEventListener('keypress', handleInputType(formControls, autocomplete))
  formEl.addEventListener('submit', handleLocationChecker(formControls, autocomplete))
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