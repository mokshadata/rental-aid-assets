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

function handleActivators(targetTime, distInWords, timeRemaining) {
  return function(el) {
    if (el.parentElement.tagName === 'A') {
      el.innerHTML = '<div class="bg-gray-3 button">Apply Today!</div>'
    } else if (el.classList.length === 1) {
      el.innerHTML = '<button class="bg-gray-3 button" disabled>Apply Today!</button>' +
        '<div class="activator--message">' +
          'Applications will open <strong><i>' + distInWords + '</i></strong>.<br/>This button will activate at 10 AM ' +
          'without a page refresh.' + 
        '</div>'
    }
    el.dataset.dist = distInWords
  }
}

function setApplyButtons(targetTime, distInWords, timeRemaining) {
  var applicationUrl = 'https://hhccommunity.force.com/tenant/s/'
  return function(el) {
    if (el.dataset.dist) {
      delete el.dataset.dist
    }

    var message = 'Due to the high volume of visitors to the website, we are experiencing technical difficulties. We appreciate your patience.'

    // if (el.parentElement.tagName === 'A') {
    //   el.parentElement.href = applicationUrl
    //   el.innerHTML = '<div class="bg-danger button">Apply Now!</div>'
    // } else if(el.classList.length === 1) {
    //   el.innerHTML = '<a class="bg-danger button" href="' + applicationUrl + '">Apply Now!</a>'
    // } else {
    //   el.innerHTML = '<a class="bg-danger button" href="' + applicationUrl + '">Start Tenant Application Now!</a>'
    // }

    if (el.parentElement.tagName === 'A') {
      el.parentElement.href = '#'
      el.innerHTML = '<div class="bg-gray-3 button">On Pause</div> '+
        '<div class="activator--message">' +
          message + 
        '</div>'
    } else if (el.classList.length === 1) {
      el.innerHTML = '<button class="bg-gray-3 button" disabled>On Pause</button>' +
        '<div class="activator--message">' +
          message + 
        '</div>'
    } else {
      el.innerHTML = message
    }
  }
}

function setupActivators() {
  var activatorEls = document.querySelectorAll('.activator')
  var hhMMSS = "10:00:00"
  var targetTime = new Date("2020-05-13T" + hhMMSS + ".000-05:00")
  var timeTolerance = 5 * 1000 // 5 seconds
  var timeBuffer = -10 * 60 * 1000 // 10 minutes
  var timeToCount = 5 * 60 * 1000 // 5 minutes

  var isRunning = true
  var previousDist = null

  function step() {
    var nowDate = new Date()
    var timeRemaining = dateFns.differenceInMilliseconds(
      targetTime,
      nowDate
    )

    var distInWords = ''
    var seconds = null
    
    if (timeRemaining > timeToCount) {
      distInWords = dateFns.distanceInWords(
        nowDate,
        targetTime,
        {
          includeSeconds: true,
          addSuffix: true
        }
      )
    } else {
      seconds = (dateFns.differenceInSeconds(
        targetTime,
        nowDate
      ) % 60)

      if (seconds < 10) {
        seconds = '0' + seconds
      }
      distInWords = 'in ' + dateFns.differenceInMinutes(
        targetTime,
        nowDate
      ) + ':' + seconds
    }

    if (previousDist !== distInWords && timeRemaining > timeTolerance) {
      Array.prototype.forEach.call(activatorEls, handleActivators(targetTime, distInWords, timeRemaining))
      previousDist = distInWords
    }
    
    if (timeRemaining <= timeTolerance) {
      Array.prototype.forEach.call(activatorEls, setApplyButtons(targetTime, distInWords, timeRemaining))
    }

    if (timeRemaining > timeBuffer) {
      window.requestAnimationFrame(step)
    } else {
      isRunning = false
    }
  }
  window.requestAnimationFrame(step)
  window.addEventListener('focus', function() {
    if (isRunning) { return }
    console.log('CHECKING')
    step()
  })
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
  setupActivators()
}

setupPage()

setTimeout(function(){
  setupLangFromQuery()
}, 1000)

})()