// JS is as IE compat as possible.  Assumes jquery is loaded.
(function() {

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

function setupLangFromQuery() {
  var parameters = new URLSearchParams(location.search)

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
    } else {
      var translator = document.querySelector('#google_translate_top select')

      if (translator) {
        translator.value = language.replace('_', '-')
        translator.dispatchEvent(new Event('change'))
      }
    }
  }
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
    } else {
      var translator = document.querySelector('#google_translate_top select')

      if (translator) {
        translator.value = language.replace('_', '-')
        translator.dispatchEvent(new Event('change'))
      }
    }
  }
}

function setupPage() {
  var amiTablesDOMNodes = document.querySelectorAll('.ami-table:not([data-processed])')
  Array.prototype.forEach.call(amiTablesDOMNodes, setupMonthly)
  Array.prototype.forEach.call(amiTablesDOMNodes, addHeadersToAMITables)

  var currencyNumeral = document.querySelectorAll('.currency-numeral')
  Array.prototype.forEach.call(currencyNumeral, formatCurrency)

  setupQueryFills()
}

setupPage()

setTimeout(function(){
  setupLangFromQuery()
}, 1000)

})()

function setupAddressChecker() {
  var selectorsForAddressParts = {
    line1: '#wf-form-self-address-check-round-2 input[name="line1"]',
    city: '#wf-form-self-address-check-round-2 input[name="city"]',
    zip: '#wf-form-self-address-check-round-2 input[name="zip"]',
    autocomplete: '#wf-form-self-address-check-round-2 input[name="autocomplete"]',
    map: '#map'
  }

  var selfCheckFormEl = document.querySelector('#wf-form-self-address-check-round-2')
  
  if (selfCheckFormEl) {
    selfCheckFormEl.addEventListener('submit', function (submitEvent) {
      submitEvent.preventDefault()
    })
  
    document.querySelector(selectorsForAddressParts.autocomplete).type = 'search'
  
    setupLocationChecker(selectorsForAddressParts, {
      handleInvalidAddress: handleBadInput,
      handleValidAddress: validateAddress
    })

    return
  }

  var applicationFormEl = document.querySelector('#application-form')

  if (applicationFormEl && setupApplicationForm) {
    setupApplicationForm()
    return
  }
  if (
    document.querySelector(selectorsForAddressParts.map) &&
    !document.querySelector(selectorsForAddressParts.autocomplete) &&
    initMap
  ) {
    initMap({ map: document.querySelector(selectorsForAddressParts.map)})
  }
}

function handleBadInput(options) {
  var formattedPlace = options.formattedPlace
  var place = options.place
  var inputs = options.inputs
  var mapParts = options.mapParts
}

function getSuccessMessageHTML(options) {
  var formattedPlace = options.formattedPlace
  var place = options.place
  var inputs = options.inputs
  var mapParts = options.mapParts
  var line1 = formattedPlace.street_number.short_name + ' ' + formattedPlace.route.short_name
  return '<div class="alert_6"><div class="alert_content_wrap"><img src="https://assets.website-files.com/5cbc1cadfad96c3229989372/5ce9f7abc0831c3acc68fd41_check-white.svg" width="14" alt="" class="alert_icon"><div class="alert_line_2"></div><div class="paragraph-2-a white-text">' +
    'The address <strong>' + line1 + '</strong> is within the City of Houston.  You meet one of <a href="#eligibility">four requirements</a> to apply.' +
    '</div></div></div>'
}

function getInvalidMessageHTML(options) {
  var formattedPlace = options.formattedPlace
  var place = options.place
  var inputs = options.inputs
  var mapParts = options.mapParts
  var line1 = formattedPlace.street_number.short_name + ' ' + formattedPlace.route.short_name
  return '<div class="alert_error"><div class="alert_content_wrap"><img src="https://assets.website-files.com/5cbc1cadfad96c3229989372/5ce9f7ab8cdd2142b971f_alert-circle-white.svg" width="16" alt="" class="alert_icon"><div class="alert_line_2"></div><div class="paragraph-2-a white-text">' +
    'The address <strong>' + line1 + '</strong> is not within the the City of Houston service area. Please see <a href="./faqs#outside-harris-assistance">FAQs</a> for other options.' +
    '</div></div></div>'
}

function validateAddress(options) {
  var formattedPlace = options.formattedPlace
  var place = options.place
  var inputs = options.inputs
  var mapParts = options.mapParts

  var messageEl = document.querySelector('#location-checker .result-message')
  var latLng = results.place.geometry.location.toJSON()
  if (!messageEl) {
    return
  }
  console.log(resuts.mapParts)
  if (!results.mapParts.searchWithin) {
    if (results.formattedPlace &&
      results.formattedPlace.locality__political &&
      results.formattedPlace.locality__political.long_name &&
      results.formattedPlace.locality__political.long_name == 'the City of Houston') {
      messageEl.innerHTML = getSuccessMessageHTML(options)
      return
    } else {
      messageEl.innerHTML = getInvalidMessageHTML(options)
      return
    }
  }

  var points = turf.points([
    [latLng.lng, latLng.lat]
  ])

  var ptsWithin = turf.pointsWithinPolygon(points, results.mapParts.searchWithin)
  if (
    (ptsWithin.features && ptsWithin.features.length)
  ) {
    messageEl.innerHTML = getSuccessMessageHTML(options)
    return
  } else {
    messageEl.innerHTML = getInvalidMessageHTML(options)
    return
  }
}