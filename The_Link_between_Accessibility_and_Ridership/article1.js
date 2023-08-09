//Station numbers, names and Leaflet features.
//'features' is a Leaflet layer group and will be populated with reach polygons and recommendations for each station number later.
//stationNode is the single Leaflet layer with the station node (needed to create the pop-up when the station is selected from the dropdown menu)
//"features" and "stationNode" are populated during "onEachFeature" function call. 
const stations = {
  1: { name: 'PY01 Kwasa Damansara', features: undefined, stationNode: undefined },
  3: { name: 'PY03 Kampung Selamat' },
  4: { name: 'PY04 Sungai Buloh' },
  5: { name: 'PY05 Damansara Damai' },
  6: { name: 'PY06 Sri Damansara Barat' },
  7: { name: 'PY07 Sri Damansara Sentral' },
  8: { name: 'PY08 Sri Damansara Timur' },
  9: { name: 'PY09 Metro Prima' },
  10: { name: 'PY10 Kepong Baru' },
  11: { name: 'PY11 Jinjang' },
  12: { name: 'PY12 Sri Delima' },
  13: { name: 'PY13 Kampung Batu' },
  14: { name: 'PY14 Kentonmen' },
  15: { name: 'PY15 Jalan Ipoh' },
  16: { name: 'PY16 Sentul Barat' },
  17: { name: 'PY17 Titiwangsa' },
  18: { name: 'PY18 Hospital Kuala Lumpur' },
  19: { name: 'PY19 Raja Uda' },
  20: { name: 'PY20 Ampang Park' },
  21: { name: 'PY21 Persiaran KLCC' },
  22: { name: 'PY22 Conlay' },
  23: { name: 'PY23 Tun Razak Exchange' },
  24: { name: 'PY24 Chan Sow Lin' },
  25: { name: 'PY25 Bandar Malaysia Utara' },
  26: { name: 'PY26 Bandar Malaysia Selatan' },
  27: { name: 'PY27 Kuchai' },
  28: { name: 'PY28 Taman Naga Emas' },
  29: { name: 'PY29 Sungai Besi' },
  31: { name: 'PY31 Serdang Raya Utara' },
  32: { name: 'PY32 Serdang Raya Selatan' },
  33: { name: 'PY33 Serdang Jaya' },
  34: { name: 'PY34 Universiti Putra Malaysia (UPM)' },
  36: { name: 'PY36 Taman Equine' },
  37: { name: 'PY37 Putra Permai' },
  38: { name: 'PY38 16 Sierra' },
  39: { name: 'PY39 Cyberjaya Utara' },
  40: { name: 'PY40 Cyberjaya City Centre' },
  41: { name: 'PY41 Putrajaya Sentral' }
};

//Leaflet map
let map;
let leafletPutrajaLineAssessment;

//Fill in all select options
populateSelect();

//Load GeoJSON and display map
loadGeoJsonAndDisplayMap();

//Fill in all select options
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
  const response = await fetch("./data/putrajayaLineRecommendations.geojson");
  const geoJson = await response.json();
  //Add the base map without any layers.
  addLeafletMap();
  //Create empty feature groups in 'stations' object
  createEmptyFeatureGroups();
  //Load the GeoJSON into the map
  showGeoJson(geoJson);
  //Hide all reachPolygons and recommendations. Only show them when station is selected
  hideReachPolygonsAndRecommendations();
}

//Create empty feature groups in 'stations' object
function createEmptyFeatureGroups() {
  for (const stationNumber in stations) {
    stations[stationNumber].features = L.featureGroup().addTo(map);
  }
}

//Add a Leaflet map to the page
function addLeafletMap() {
  const defaultOsmTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    // maxZoom: 13,
    minZoom: 10,
  });

  map = L.map('map', {
    //center: [3.19, 101.60], //defined by "fitBounds"
    //zoom: 12, //defined by "fitBounds"
    layers: defaultOsmTiles,
    zoomControl: false, //Needed in order to separate zoom control buttons and full screen button

    fullscreenControl: true,
    fullscreenControlOptions: {
      position: 'topright'
    }
  });
  //Code below needed in order to separate zoom control buttons and full screen button
  L.control.zoom({
    position: 'topleft'
  }).addTo(map);
}


//Show GeoJSON features on the Leaflet map & add functions to determine what happens on mouseover
function showGeoJson(inputGeoJson) {
  const trainIcon = L.icon({
    iconUrl: './data/metro.png',
    iconSize: [20, 50], // size of the icon
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

    //Add reach polygons and recommendations to respective feature group in 'stations'
    if (feature.properties.type === "recommendation" || feature.properties.type === "reachPolygons") {
      // console.log('called!');
      stations[feature.properties["part-of"]].features.addLayer(layer);
    }

    //Add station node layer to station.stationNode
    if (feature.properties.type === "station") {
      // console.log('called!');
      stations[feature.properties["part-of"]].stationNode = layer;
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
    //Open info table on click. If station is selected show appropriate reachPolygons and recommendations.
    layer.on('click', function (e) {
      /*
      console.log(e);
      console.log(e.target.feature.properties['part-of']);
      */
      const leafletPopup = generatePopupHtml(e.target);
      leafletPopup
        .setLatLng(e.latlng)
        .openOn(map);
      /*If a station has been clicked:
      Forward station number to function that shows appropriate reachPolygons and recommendations*/
      if (feature.properties.type === "station") showreachPolygonsAndRecommendationsAndZoom(e.target.feature.properties['part-of']);
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

  //Popup with station infos
  const mapContainer = document.querySelector("#map");
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

/*If station has been selected in the dropdown list:
- Show reachPolygons and recommendations for this station
- zoom to associated map elements
- Open station pop-up*/
let stationsSelector = document.getElementById('stations');
stationsSelector.addEventListener('change', event => {
  let selectedStationNumber = event.target.value;
  showreachPolygonsAndRecommendationsAndZoom(selectedStationNumber);

  //open station pop-up
  const stationNode = stations[selectedStationNumber].stationNode//Leaflet layer of station node
  const leafletPopup = generatePopupHtml(stationNode);
  leafletPopup
    .setLatLng(stationNode.getLatLng())
    .openOn(map);
});

function showreachPolygonsAndRecommendationsAndZoom(stationNumber) {
  // console.log(`station number: ${stationNumber}`);
  //1. Remove all old reachPolygons and recommendations from previous selections
  hideReachPolygonsAndRecommendations();
  //2. Show featureGroup with appropriate reachPolygons and recommendations
  map.addLayer(stations[stationNumber].features);
  //3. Zoom to elements of featureGroup
  map.fitBounds(stations[stationNumber].features.getBounds());
}

//temp
var x, i, j, l, ll, selElmnt, a, b, c;
/* Look for any elements with the class "custom-select": */
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  ll = selElmnt.length;
  /* For each element, create a new DIV that will act as the selected item: */
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);
  /* For each element, create a new DIV that will contain the option list: */
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 1; j < ll; j++) {
    /* For each option in the original select element,
    create a new DIV that will act as an option item: */
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function(e) {
        /* When an item is clicked, update the original select box,
        and the selected item: */
        var y, i, k, s, h, sl, yl;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        sl = s.length;
        h = this.parentNode.previousSibling;
        for (i = 0; i < sl; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;
            y = this.parentNode.getElementsByClassName("same-as-selected");
            yl = y.length;
            for (k = 0; k < yl; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function(e) {
    /* When the select box is clicked, close any other select boxes,
    and open/close the current select box: */
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });
}

function closeAllSelect(elmnt) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
  var x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);