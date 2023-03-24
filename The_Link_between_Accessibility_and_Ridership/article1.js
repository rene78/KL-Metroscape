//Leaflet map
let map;

//Add the base map without any layers.
addLeafletMap();

//Load the example GeoJSON into the map
showGeoJson(mrt2);

//Add a Leaflet map to the page
function addLeafletMap() {
  const defaultOsmTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    // maxZoom: 13,
    minZoom: 2
  });

  map = L.map('map', {
    center: [3.19, 101.60], //should be defined by "fitBounds"
    zoom: 12, //should be defined by "fitBounds"
    layers: defaultOsmTiles
  });
}

//Show GeoJSON polygons on the Leaflet map & add functions to determine what happens on mouseover
function showGeoJson(inputGeoJson) {
  let leafletContinents = L.geoJSON(inputGeoJson, {
    // onEachFeature: onEachFeature,
    // style: style
  })
  // console.log(leafletContinents.getLayers());
  leafletContinents.addTo(map);
}

//Which station has been selected?
let stationsSelector = document.getElementById('stations');
stationsSelector.addEventListener('change', event => {
  console.log(event.target.value);
});