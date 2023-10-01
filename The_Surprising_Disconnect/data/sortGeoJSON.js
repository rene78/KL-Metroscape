/*
Purpose of this helper script:
- Sort GeoJSON elements, so that a recommendation feature is always above a reach polygon in order for it to remain clickable

Usage
- Just open sortGeoJSON.html and copy newly sorted GeoJSON. Paste it to putrajayaLineRecommendations.geojson
*/

let inputGeoJSON;
getGeoJSON();

async function getGeoJSON() {
  const response = await fetch("putrajayaLineRecommendationsTemp.geojson");
  inputGeoJSON = await response.json();

  addSortValue();
  let sortedGeoJsonFeatures = inputGeoJSON.features.sort(compare);
  //console.log(sortedGeoJsonFeatures);
  const sortedGeoJSon =
    `
      {
        "type": "FeatureCollection",
        "features": ${JSON.stringify(sortedGeoJsonFeatures)}
      }
    `;
  document.querySelector("#output").innerText = sortedGeoJSon;
}

/*
Traverse the GeoJSON and add a "sort" k-v pair. This is the sort order:

1. Reach 900        "type": "reachPolygons" & "value": "900" --> "sort": 0
2. Reach 600        "type": "reachPolygons" & "value": "600" --> "sort": 1
3. Reach 300        "type": "reachPolygons" & "value": "300" --> "sort": 2
4. Recommendations  "type": "recommendation"                 --> "sort": 3
5. Stations         "type": "station"                        --> "sort": 4
6. Mrtline          "type": "mrtline"                        --> "sort": 5
*/
function addSortValue() {
  for (let i = 0; i < inputGeoJSON.features.length; i++) {
    const type = inputGeoJSON.features[i].properties.type;
    if (type === "mrtline") inputGeoJSON.features[i].properties.sort = 5;
    else if (type === "station") inputGeoJSON.features[i].properties.sort = 4;
    else if (type === "recommendation") inputGeoJSON.features[i].properties.sort = 3;
    else if (type === "reachPolygons") {
      const reach = inputGeoJSON.features[i].properties.value
      if (reach == "300") inputGeoJSON.features[i].properties.sort = 2;
      else if (reach == "600") inputGeoJSON.features[i].properties.sort = 1;
      else if (reach == "900") inputGeoJSON.features[i].properties.sort = 0;
    }
    else console.log('There is some bug. This should not be executed');

    //Furthermore update the name, e.g. change it from [[Raja Uda MRT station|PY19 Raja Uda]]"
    //to "PY19 Raja Uda"
    const title = inputGeoJSON.features[i].properties.title;
    if (title) {
      const locationOfVerticalBar = title.indexOf("|");
      if (locationOfVerticalBar === -1) continue;//Skip this title if there is no "|" in it.
      const updatedTitle = title.slice(locationOfVerticalBar + 1, -2);
      inputGeoJSON.features[i].properties.title = updatedTitle;
    }
  }
  //console.log(exampleGeoJSON);
}

//Sort the array elements according to sort order defined above
function compare(a, b) {
  if (a.properties.sort < b.properties.sort) {
    return -1;
  }
  if (a.properties.sort > b.properties.sort) {
    return 1;
  }
  return 0;
}