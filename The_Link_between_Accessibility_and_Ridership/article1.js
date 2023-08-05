//All station names and numbers & empty object 'features' for Leaflet layer groups.
//'Features' will be populated with reach polygons and recommendations for each station number later.
const stations = {
  1: { name: 'PY01 Kwasa Damansara', features: undefined },
  3: { name: 'PY03 Kampung Selamat', features: undefined },
  4: { name: 'PY04 Sungai Buloh', features: undefined },
  5: { name: 'PY05 Damansara Damai', features: undefined },
  6: { name: 'PY06 Sri Damansara Barat', features: undefined },
  7: { name: 'PY07 Sri Damansara Sentral', features: undefined },
  8: { name: 'PY08 Sri Damansara Timur', features: undefined },
  9: { name: 'PY09 Metro Prima', features: undefined },
  10: { name: 'PY10 Kepong Baru', features: undefined },
  11: { name: 'PY11 Jinjang', features: undefined },
  12: { name: 'PY12 Sri Delima', features: undefined },
  13: { name: 'PY13 Kampung Batu', features: undefined },
  14: { name: 'PY14 Kentonmen', features: undefined },
  15: { name: 'PY15 Jalan Ipoh', features: undefined },
  16: { name: 'PY16 Sentul Barat', features: undefined },
  17: { name: 'PY17 Titiwangsa', features: undefined },
  18: { name: 'PY18 Hospital Kuala Lumpur', features: undefined },
  19: { name: 'PY19 Raja Uda', features: undefined },
  20: { name: 'PY20 Ampang Park', features: undefined },
  21: { name: 'PY21 Persiaran KLCC', features: undefined },
  22: { name: 'PY22 Conlay', features: undefined },
  23: { name: 'PY23 Tun Razak Exchange', features: undefined },
  24: { name: 'PY24 Chan Sow Lin', features: undefined },
  25: { name: 'PY25 Bandar Malaysia Utara', features: undefined },
  26: { name: 'PY26 Bandar Malaysia Selatan', features: undefined },
  27: { name: 'PY27 Kuchai', features: undefined },
  28: { name: 'PY28 Taman Naga Emas', features: undefined },
  29: { name: 'PY29 Sungai Besi', features: undefined },
  31: { name: 'PY31 Serdang Raya Utara', features: undefined },
  32: { name: 'PY32 Serdang Raya Selatan', features: undefined },
  33: { name: 'PY33 Serdang Jaya', features: undefined },
  34: { name: 'PY34 Universiti Putra Malaysia (UPM)', features: undefined },
  36: { name: 'PY36 Taman Equine', features: undefined },
  37: { name: 'PY37 Putra Permai', features: undefined },
  38: { name: 'PY38 16 Sierra', features: undefined },
  39: { name: 'PY39 Cyberjaya Utara', features: undefined },
  40: { name: 'PY40 Cyberjaya City Centre', features: undefined },
  41: { name: 'PY41 Putrajaya Sentral', features: undefined }
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
    const stationName = stations[stationNumber].name;
    optionsHtml += `<option value="${stationNumber}">${stationName}</option>`;
  }
  document.querySelector("#stations").innerHTML = optionsHtml;
}

//Load the Putrajaya Line GeoJSON. Once this is done instantiate the Leaflet map and load the GeoJSON into the map
async function loadGeoJsonAndDisplayMap() {
  const response = await fetch("./data/putrajayaLineRecommendations_alles.geojson");
  const geoJson = await response.json();
  //Add the base map without any layers.
  addLeafletMap();
  //Create empty layer groups in 'stations' object
  createEmptyLayerGroups();
  //Load the GeoJSON into the map
  showGeoJson(geoJson);
  //Hide all reachPolygons and recommendations. Only show them when station is selected
  hideReachPolygonsAndRecommendations();
}

//Create empty layer groups in 'stations' object
function createEmptyLayerGroups() {
  for (const stationNumber in stations) {
    stations[stationNumber].features = L.layerGroup().addTo(map);
  }
}

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
    console.log(feature);
    // console.log(layer);

    //Add reach polygons and recommendations to respective layer group in 'stations'
    if (feature.properties.type === "recommendation" || feature.properties.type === "reachPolygons") {
      console.log('called!');
      stations[feature.properties["part-of"]].features.addLayer(layer);
    }

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
      */
    });
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
      <h3 class="popup-heading">${stations[parseInt(element.feature.properties["part-of"])].name}</h3>
      <div>${element.feature.properties.comment}</div>
      `;
  }
  else if (type === "reachPolygons") {
    popupHtml = `
      <h3 class="popup-heading">${stations[parseInt(element.feature.properties["part-of"])].name}</h3>
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

//Hide all reachPolygons and recommendations
function hideReachPolygonsAndRecommendations() {
  for (const stationNumber in stations) {
    map.removeLayer(stations[stationNumber].features);
  }
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

/*Proceed with:
When a station is selected on drop down or on the map:
- Remove all reachPolygons and recommendations
- Display reachPolygons and recommendations for selected station
- If it works --> Remove the 2 GeoJSONS and the temp below
*/


//Temp: Load GeoJSON recommendations of station 1
let stationPutrajaLineAssessmentLayer;

const wrapper = document.getElementById('wrapper');

wrapper.addEventListener('click', async event => {
  const isButton = event.target.nodeName === 'BUTTON';
  if (!isButton) {
    return;
  }

  let stationNumber = event.target.value;
  console.log(stationNumber);
  let stationGeoJsonToRender = {
    "type": "FeatureCollection",
    "features": []
  };

  //Remove old recommendations from map
  if (stationPutrajaLineAssessmentLayer) map.removeLayer(stationPutrajaLineAssessmentLayer);

  //Load GeoJSON with recommendations for Putrajaya Line
  const response = await fetch("./data/putrajayaLineRecommendations.geojson");
  const putrajayaLineRecommendations = await response.json();
  for (let i = 0; i < putrajayaLineRecommendations.features.length; i++) {
    if (putrajayaLineRecommendations.features[i].properties["part-of"] == stationNumber) {
      stationGeoJsonToRender.features.push(putrajayaLineRecommendations.features[i])
    }
  }
  // console.log(stationGeoJsonToRender);

  //Add filtered GeoJSON to map
  stationPutrajaLineAssessmentLayer = L.geoJSON(stationGeoJsonToRender,
    // {
    //   onEachFeature: onEachFeature,
    //   style: style,
    //   pointToLayer(feature, latlng) {
    //     return L.marker(latlng, { icon: trainIcon });
    //   }
    // }
  )
  //Add GeoJSON to map
  stationPutrajaLineAssessmentLayer.addTo(map);
})
