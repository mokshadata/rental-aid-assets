function getInputEls(selectorsForAddressParts, enforce) {
  var enforce = (enforce === undefined && true) || enforce

  var readonlyParts = ['line1', 'city', 'zip']

  var addressParts = Object.keys(selectorsForAddressParts)

  var inputsForAddressParts = {}

  addressParts.forEach(function (partName) {
    var partSelector = selectorsForAddressParts[partName]
    inputsForAddressParts[partName] = document.querySelector(partSelector)
  })

  if (!enforce) {
    return inputsForAddressParts
  }

  readonlyParts.forEach(function (partName) {
    if (!inputsForAddressParts[partName]) {
      return
    }
    inputsForAddressParts[partName].setAttribute('readonly', true)
  })

  return inputsForAddressParts
}

function setupLocationChecker(selectorsForAddressParts, handlers, enforce) {
  var enforce = (enforce === undefined && true) || enforce
  var inputs = getInputEls(selectorsForAddressParts, enforce)
  var bounds = {
    north: 30.166256,
    east: -94.920227,
    south: 29.490625,
    west: -95.962188
  }
  var geocoder = new google.maps.Geocoder()
  var addressInputElement = inputs.autocomplete
  var autocomplete = new google.maps.places.Autocomplete(addressInputElement)

  var mapParts = initMap(inputs)

  if (addressInputElement.value && addressInputElement.value.length) {
    geocoder.geocode({
      address: addressInputElement.value,
      bounds: bounds
    }, function(results, status) {
      if (status == 'OK') {
        var place = results[0]
        formattedPlace = formatAddressParts(place)
        var options = {
          formattedPlace: formattedPlace,
          place: place,
          inputs: inputs,
          mapParts: mapParts
        }
  
        fillInAddress(formattedPlace, place, inputs)
        setMarker(formattedPlace, place, inputs, mapParts)
  
        if (handlers.handleValidAddress) {
          handlers.handleValidAddress(options)
        }
      }
    })
  }

  // Harris County northwest: 30.166256, -95.962188
  // Harris County southeast: 29.490625, -94.920227
  autocomplete.setBounds(bounds)

  autocomplete.setTypes(['address'])
  autocomplete.setFields(
    ['address_components', 'formatted_address', 'geometry', 'icon', 'name', 'place_id'])

  autocomplete.addListener('place_changed', function() {
    var place = autocomplete.getPlace()
    var formattedPlace
    var options = {
      formattedPlace: formattedPlace,
      place: place,
      inputs: inputs,
      mapParts: mapParts
    }

    if (!place.geometry) {
      if (handlers.handleInvalidAddress) {
        handlers.handleInvalidAddress(options)
      }
    } else {
      // Place result, see example value here:
      // Read more here: https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult
      formattedPlace = formatAddressParts(place)
      options.formattedPlace = formattedPlace

      fillInAddress(formattedPlace, place, inputs)
      setMarker(formattedPlace, place, inputs, mapParts)

      if (handlers.handleValidAddress) {
        handlers.handleValidAddress(options)
      }
    }
  })

  return {
    inputs: inputs,
    mapParts: mapParts,
    autocomplete: autocomplete,
    geocoder: geocoder
  }
}

function initMap(inputs) {
  var center = {
    lat: 29.8866753,
    lng: -95.4731219
  }

  var CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  })
  var map = L.map(inputs.map).setView(center, 9)
  map.fitBounds([{
    lat: 30.166256,
    lng: -94.920227,
  }, {
    lat: 29.490625,
    lng: -95.962188
  }])
  CartoDB_Voyager.addTo(map)

  var marker = L.marker(center)
  marker.setOpacity(0)
  marker.addTo(map)

  fetch('https://mokshadata.gitlab.io/rental-aid-assets/data/coh.geojson')
    .then(function (response){ return response.json() })
    .then(function (data) {
      L.geoJSON(data, {
        style: function (feature) {
          return {
            color: 'green',
            fillOpacity: 0.1,
            weight: 2
          };
        }
      }).addTo(map)
    })

  return { map: map, marker: marker }
}

function formatAddressParts(place) {
  var placeParts = {}

  place.address_components.forEach(function (part) {
    placeParts[part.types.join('__')] = part
  })

  return placeParts
}

function fillInAddress(formattedPlace, place, inputs) {
  if (inputs.line1) {
    inputs.line1.value = formattedPlace.street_number.short_name + ' ' + formattedPlace.route.short_name
  }
  if (inputs.city) {
    inputs.city.value = formattedPlace.locality__political.long_name
  }
  if (inputs.zip) {
    inputs.zip.value = formattedPlace.postal_code.long_name
  }
}

function setMarker(formattedPlace, place, inputs, mapParts) {
  var map = mapParts.map
  var center = place.geometry.location.toJSON()

  mapParts.marker.setLatLng(center)
  mapParts.marker.setOpacity(1)
  map.setView(center, 10)
}