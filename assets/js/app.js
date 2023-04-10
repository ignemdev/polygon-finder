//imports
import polygonMap from "./PolygonMap.js";

//elements
const mapContainer = document.querySelector("#map");
const polygonsInput = document.querySelector("#polygons-input");
const markersInput = document.querySelector("#markers-input");
const drawBtn = document.querySelector("#draw-btn");
const downloadBtn = document.querySelector("#download-btn");

//logic
const polyMap = new polygonMap(mapContainer);

const downloadMarkersWithPolygons = () => {
  const markersWithPolygons = polyMap.getMarkersWithPolygons();

  if (!Array.isArray(markersWithPolygons) || markersWithPolygons?.length <= 0)
    return;

  const dataURL = `data:application/json,${JSON.stringify(
    markersWithPolygons
  )}`;
  downloadBtn.setAttribute("download", "MarkersWithPolygons.json");
  downloadBtn.setAttribute("href", dataURL);
};

const readFile = (input, drawFunction) => {
  const file = input.files[0];

  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = ({ target: { result } }) =>
    drawFunction(JSON.parse(result));
  fileReader.readAsText(file);
};

const drawPolygonsAndMarkers = () => {
  polyMap.cleanMap();
  readFile(markersInput, polyMap.setMarkers.bind(polyMap));
  readFile(polygonsInput, polyMap.setPolygons.bind(polyMap));
};

//listeners
downloadBtn.addEventListener("click", downloadMarkersWithPolygons);
drawBtn.addEventListener("click", drawPolygonsAndMarkers);
