//Leaflet map
let map;

let leafletPutrajaLineCommentsElements;

//Add the base map without any layers.
addLeafletMap();

//Load the example GeoJSON into the map
showGeoJson(putrajayaLineComments);
showGeoJson(putrajayaLine);

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

//Show GeoJSON polygons on the Leaflet map & add functions to determine what happens on mouseover
function showGeoJson(inputGeoJson) {
  leafletPutrajaLineCommentsElements = L.geoJSON(inputGeoJson, {
    onEachFeature: onEachFeature,
    style: style
  })

  //Add GeoJSON to map
  leafletPutrajaLineCommentsElements.addTo(map);

  //Center and zoom the map on the provided GeoJSON
  map.fitBounds(leafletPutrajaLineCommentsElements.getBounds());

  //Define what happens when hovering over each polygon/way/marker
  function onEachFeature(feature, layer) {
    // console.log(feature);
    // console.log(layer);

    //Increase line weight when feature gets focus
    layer.on('mouseover', function (e) {
      layer.setStyle({ weight: 8 });
    });

    //Change line weight back when feature loses focus
    layer.on('mouseout', function (e) {
      layer.setStyle({ weight: 5 });
    });

    //Open info table on click
    layer.on('click', function (e) {
      console.log(e.target.feature.properties.title);
    });
  }

  //Style the polygons according to continent
  function style(feature) {
    let style = { "color": "blue", "weight": 5 };

    // console.log(style);
    return style;
  }
}

//If station has been selected in the dropdown list --> Zoom to associated map elements
let stationsSelector = document.getElementById('stations');
stationsSelector.addEventListener('change', event => {
  let selectedStationNumber = parseInt(event.target.value);
  const elementsBelongingToSelectedStation = L.featureGroup();
  leafletPutrajaLineCommentsElements.eachLayer(function (l) {
    // console.log('selectedStationNumber: ' + selectedStationNumber + ' typeOf: ' + typeof (selectedStationNumber));
    // console.log('l.feature.properties["part-of"]: ' + l.feature.properties["part-of"] + ' typeOf: ' + typeof (l.feature.properties["part-of"]));
    if (selectedStationNumber === l.feature.properties["part-of"]) {
      // console.log('found!');
      //Add element to feature group
      l.addTo(elementsBelongingToSelectedStation);
    }
  });
  //Zoom and pan to featureGroup
  map.fitBounds(elementsBelongingToSelectedStation.getBounds());
});