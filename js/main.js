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

function isValid(response) {
  if (response[0] === true) {
    return true
  } 
  return false
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
    var locationCheckerURL = 'https://boundary-pip.herokuapp.com/houston-pip?' +
      'lat=' + place.geometry.location.lat() + '&lon=' + place.geometry.location.lng()

    $.get(locationCheckerURL)
      .then(function (response) {
        if (isValid(response)) {
          formControls.submitButton.value = 'Yes'
        } else {
          formControls.submitButton.value = 'No'
        }
      })
  }
}

function renderLocationChecker(formControls, autocomplete) {
  if (formControls.state.canVerify) {
    if (
      formControls.submitButton.value === 'Verify' &&
      formControls.submitButton.dataset.disabled === 'false'
    ) {
      return
    }
    formControls.submitButton.dataset.disabled = false
    formControls.submitButton.value = 'Verify'
  } else {
    if (
      formControls.submitButton.value === 'Verify' &&
      formControls.submitButton.dataset.disabled === 'true'
    ) {
      return
    }
    formControls.submitButton.dataset.disabled = true
    formControls.submitButton.value = 'Verify'
  }
}

function handleInputType(formControls, autocomplete) {
  return function (changeEvent) {
    formControls.state.canVerify = false
    renderLocationChecker(formControls, autocomplete)
  }
}

function handlePlaceChange(formControls, autocomplete) {
  return function (changeEvent) {
    var place = autocomplete.getPlace.call(autocomplete)
    if (!place.geometry) {
      formControls.state.canVerify = false
    } else {
      formControls.state.canVerify = true
    }
    renderLocationChecker(formControls, autocomplete)
  }
}

function getFormEls(formEl) {
  var inputEl = formEl.querySelector('[name="address"]')
  var submitButtonEl = formEl.querySelector('[type=submit]')
  
  return {
    input: inputEl,
    submitButton: submitButtonEl,
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

function setupQueryFills() {
  var parameters = new URLSearchParams(location.search)

  var confirmationNumberEls = document.querySelectorAll('.confirmation-number')
  if (confirmationNumberEls && parameters.get('confirmation-number')) {
    Array.prototype.forEach.call(confirmationNumberEls, function setupConfNum(el) {
      el.dataset.confirm = parameters.get('confirmation-number')
    })
  }

  if (parameters.get('language')) {
    var language = parameters.get('language')

    if  (document.querySelector('#' + language + '.boxed')) {
      var messageEls = document.querySelectorAll('.thank-you-message')
      Array.prototype.forEach.call(messageEls, function setupLang(el) {
        if (el.id === language) {
          el.classList.remove('hide')
        } else if (!el.classList.contains('hide')) {
          el.classList.add('hide')
        }
      })
    }
  }
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

  setupQueryFills()
}

setupPage()