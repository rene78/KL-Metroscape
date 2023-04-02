//Leaflet map
let map;
let leafletPutrajaLineAssessment;

loadGeoJsonAndDisplayMap();

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
      console.log(e);
      console.log(e.target.feature.properties.title);

      const tableHtml = `
        <h2>${e.target.feature.properties.title}</h2>
        <p>${e.target.feature.properties.comment}</p>
      `;
      let mapContainer = document.querySelector("#map");

      //Popup with tag comparison table
      L.popup({
        maxWidth: mapContainer.clientWidth - 45,
        maxHeight: mapContainer.clientHeight - 40,
        className: "stylePopup"
      })
        .setLatLng(e.latlng)
        .setContent(tableHtml)
        .openOn(map);
    });
  };

  //Style the features
  function style(feature) {
    // console.log(feature.properties);
    if (feature.properties.type === "recommendation") return { "color": "green", "weight": 5 };
    else if (feature.properties.type === "mrtline") return { "color": "#ffcc00", "weight": 5 };
    else if (feature.properties.type === "reachPolygons") {
      // console.log(feature.properties.value);
      if (feature.properties.value === "300") return { "fillColor": "green", "fillOpacity": 0.5, "weight": 0 };
      else if (feature.properties.value === "600") return { "fillColor": "orange", "fillOpacity": 0.5, "weight": 0 };
      else if (feature.properties.value === "900") return { "fillColor": "red", "fillOpacity": 0.5, "weight": 0 };
    }

    let style = { "color": "blue", "weight": 5 };
    // console.log(style);
    return style;
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
    if (selectedStationNumber === l.feature.properties["part-of"]) {
      // console.log('found!');
      //Add element to feature group
      l.addTo(elementsBelongingToSelectedStation);
    }
  });
  //Zoom and pan to featureGroup
  map.fitBounds(elementsBelongingToSelectedStation.getBounds());
});