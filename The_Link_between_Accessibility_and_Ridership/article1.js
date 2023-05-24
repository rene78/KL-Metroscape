//All station names and numbers
const stations = {
  1: 'PY01 Kwasa Damansara',
  3: 'PY03 Kampung Selamat',
  4: 'PY04 Sungai Buloh',
  5: 'PY05 Damansara Damai',
  6: 'PY06 Sri Damansara Barat',
  7: 'PY07 Sri Damansara Sentral',
  8: 'PY08 Sri Damansara Timur',
  9: 'PY09 Metro Prima',
  10: 'PY10 Kepong Baru',
  11: 'PY11 Jinjang',
  12: 'PY12 Sri Delima',
  13: 'PY13 Kampung Batu',
  14: 'PY14 Kentonmen',
  15: 'PY15 Jalan Ipoh',
  16: 'PY16 Sentul Barat',
  17: 'PY17 Titiwangsa',
  18: 'PY18 Hospital Kuala Lumpur',
  19: 'PY19 Raja Uda',
  20: 'PY20 Ampang Park',
  21: 'PY21 Persiaran KLCC',
  22: 'PY22 Conlay',
  23: 'PY23 Tun Razak Exchange',
  24: 'PY24 Chan Sow Lin',
  25: 'PY25 Bandar Malaysia Utara',
  26: 'PY26 Bandar Malaysia Selatan',
  27: 'PY27 Kuchai',
  28: 'PY28 Taman Naga Emas',
  29: 'PY29 Sungai Besi',
  31: 'PY31 Serdang Raya Utara',
  32: 'PY32 Serdang Raya Selatan',
  33: 'PY33 Serdang Jaya',
  34: 'PY34 Universiti Putra Malaysia (UPM)',
  36: 'PY36 Taman Equine',
  37: 'PY37 Putra Permai',
  38: 'PY38 16 Sierra',
  39: 'PY39 Cyberjaya Utara',
  40: 'PY40 Cyberjaya City Centre',
  41: 'PY41 Putrajaya Sentral'
};

//Leaflet map
let map;
let leafletPutrajaLineAssessment;

loadGeoJsonAndDisplayMap();

//Fill in all select options
populateSelect();
function populateSelect() {
  let optionsHtml = '<option hidden disabled selected> Select a station </option>';

  for (const stationNumber in stations) {
    const stationName = stations[stationNumber];
    optionsHtml += `<option value="${stationNumber}">${stationName}</option>`;
  }
  document.querySelector("#stations").innerHTML = optionsHtml;
}

//Load the Putrajaya Line GeoJSON. Once this is done instantiate the Leaflet map and load the GeoJSON into the map
async function loadGeoJsonAndDisplayMap() {
  const response = await fetch("./data/putrajayaLineRecommendations.geojson");
  const geoJson = await response.json();
  //Add the base map without any layers.
  addLeafletMap();
  //Load the GeoJSON into the map
  showGeoJson(geoJson);
}
// showGeoJson(putrajayaLineComments);
// showGeoJson(putrajayaLine);

//Add a Leaflet map to the page
function addLeafletMap() {
  const defaultOsmTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    // maxZoom: 13,
    minZoom: 10
  });

  map = L.map('map', {
    //center: [3.19, 101.60], //defined by "fitBounds"
    //zoom: 12, //defined by "fitBounds"
    layers: defaultOsmTiles
  });
}

//Show GeoJSON features on the Leaflet map & add functions to determine what happens on mouseover
function showGeoJson(inputGeoJson) {
  const trainIcon = L.icon({
    iconUrl: './data/metro.png',
    iconSize: [20, 50], // size of the icon
    //iconAnchor: [-10, 0], // point of the icon which will correspond to marker's location
    //popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
  });

  leafletPutrajaLineAssessment = L.geoJSON(inputGeoJson, {
    onEachFeature: onEachFeature,
    style: style,
    pointToLayer(feature, latlng) {
      return L.marker(latlng, { icon: trainIcon });
    }
  })

  //Add GeoJSON to map
  leafletPutrajaLineAssessment.addTo(map);

  //Center and zoom the map on the provided GeoJSON
  map.fitBounds(leafletPutrajaLineAssessment.getBounds());

  //Define what happens when hovering over each polygon/way/marker
  function onEachFeature(feature, layer) {
    // console.log(feature);
    // console.log(layer);

    //Increase line weight on focus for recommendation features
    if (feature.properties.type === "recommendation") {
      //Increase line weight when feature gets focus
      layer.on('mouseover', function (e) {
        layer.setStyle({ weight: 8 });
      });

      //Change line weight back when feature loses focus
      layer.on('mouseout', function (e) {
        layer.setStyle({ weight: 5 });
      });
    }
    //Open info table on click
    layer.on('click', function (e) {
      const leafletPopup = generatePopupHtml(e.target);
      leafletPopup
        .setLatLng(e.latlng)
        .openOn(map);
      /*
      console.log(e);
      console.log(e.target.feature.properties.title);
      const mapContainer = document.querySelector("#map");
 
      //Popup with station infos
      L.popup({
        maxWidth: mapContainer.clientWidth - 45,
        maxHeight: mapContainer.clientHeight - 40,
        className: "stylePopup"
      })
        .setLatLng(e.latlng)
        .setContent(popupHtml)
        .openOn(map);
        */
    }
    );
  };

  //Style the features
  function style(feature) {
    // console.log(feature.properties);
    if (feature.properties.type === "recommendation") return { "color": "green", "weight": 5 };
    else if (feature.properties.type === "mrtline") return { "color": "#ffcc00", "weight": 5 };
    else if (feature.properties.type === "reachPolygons") {
      // console.log(feature.properties.value);
      if (feature.properties.value == "300") return { "fillColor": "green", "fillOpacity": 0.5, "weight": 0 };
      else if (feature.properties.value == "600") return { "fillColor": "orange", "fillOpacity": 0.5, "weight": 0 };
      else if (feature.properties.value == "900") return { "fillColor": "red", "fillOpacity": 0.5, "weight": 0 };
    }

    let style = { "color": "blue", "weight": 5 };
    // console.log(style);
    return style;
  }
}

//Generate and return Leaflet Popup element
function generatePopupHtml(element) {
  //Render popup for "station", "recommendation", "reach" and "line" separately
  const type = element.feature.properties.type
  let popupHtml;

  //Type "station"
  if (type === "station") {
    popupHtml = `
      <h3 class="popup-heading">${element.feature.properties.title}</h3>
      <div class="stars">
        <div class="star activated"></div>
        <div class="star ${element.feature.properties.stars > 1 ? "activated" : ""} "></div>
        <div class="star ${element.feature.properties.stars > 2 ? "activated" : ""} "></div>
      </div>
      <div>${element.feature.properties.comment}</div>
    `;
  }
  else if (type === "recommendation") {
    popupHtml = `
      <h3 class="popup-heading">${stations[parseInt(element.feature.properties["part-of"])]}</h3>
      <div>${element.feature.properties.comment}</div>
      `;
  }
  else if (type === "reachPolygons") {
    popupHtml = `
      <h3 class="popup-heading">${stations[parseInt(element.feature.properties["part-of"])]}</h3>
      <ul>
        <li>This area can be reached on foot within ${(element.feature.properties.label).trim()} from the station</li>
        <li>Population (estimated): ${element.feature.properties.total_pop}</li>
        <li>Surface area: ${element.feature.properties.area}</li>
      </ul>
      `;
  }
  else if (type === "mrtline") {
    popupHtml = `
        <h3 class="popup-heading">MRT Putrajaya Line</h3>
      `;
  }
  // return popupHtml;
  //Open info table on click

  const mapContainer = document.querySelector("#map");
  console.log(element);

  //Popup with station infos
  const leafletPopup = L.popup({
    maxWidth: mapContainer.clientWidth - 45,
    maxHeight: mapContainer.clientHeight - 40,
    className: "stylePopup"
  })
    .setContent(popupHtml)
  return leafletPopup;
}

//If station has been selected in the dropdown list --> Zoom to associated map elements
let stationsSelector = document.getElementById('stations');
stationsSelector.addEventListener('change', event => {
  let selectedStationNumber = event.target.value;
  const elementsBelongingToSelectedStation = L.featureGroup();
  leafletPutrajaLineAssessment.eachLayer(function (l) {
    // console.log('selectedStationNumber: ' + selectedStationNumber + ', typeOf: ' + typeof (selectedStationNumber));
    // console.log('l.feature.properties["part-of"]: ' + l.feature.properties["part-of"] + ', typeOf: ' + typeof (l.feature.properties["part-of"]));
    if (selectedStationNumber == l.feature.properties["part-of"]) {
      // console.log('found!');
      //Add element to feature group
      l.addTo(elementsBelongingToSelectedStation);

      //open station pop-up if correct station element is found
      if (l.feature.properties.type === "station") {
        console.log(l.feature);
        const leafletPopup = generatePopupHtml(l);
        leafletPopup
          .setLatLng(l.getLatLng())
          .openOn(map);
      }
    }
  });
  //Zoom and pan to featureGroup
  map.fitBounds(elementsBelongingToSelectedStation.getBounds());

});