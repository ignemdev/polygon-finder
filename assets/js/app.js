//imports
import polygonMap from "./PolygonMap.js";
import { getCsv } from "./helpers.js";

//elements
const mapContainer = document.querySelector("#map");
const polygonsInput = document.querySelector("#polygons-input");
const markersInput = document.querySelector("#markers-input");
const drawBtn = document.querySelector("#draw-btn");
const cleanBtn = document.querySelector("#clean-btn");
const downloadBtn = document.querySelector("#download-btn");
const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');

//logic
const polyMap = new polygonMap(mapContainer);

const triggerDownload = (dataURL, filename) => {
  const downloadLink = document.createElement("a");
  downloadLink.setAttribute("download", filename);
  downloadLink.setAttribute("href", dataURL);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

const downloadMarkersWithPolygons = () => {
  const markersWithPolygons = polyMap.getMarkersWithPolygons();

  if (!Array.isArray(markersWithPolygons) || markersWithPolygons?.length <= 0)
    return;

  const csvMarkersWithPolygons = getCsv(markersWithPolygons);
  const dataURL = `data:application/csv,${csvMarkersWithPolygons}`;

  triggerDownload(dataURL, "LocatedMarkers.csv");

  polyMap.clean();
};

const readFile = (input, drawFunction) => {
  const file = input.files[0];

  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = ({ target: { result } }) =>
    drawFunction(JSON.parse(result));
  fileReader.readAsText(file);
  input.value = null;
};

const drawPolygonsAndMarkers = () => {
  if (!markersInput.value || !polygonsInput.value) return;

  polyMap.clean();
  readFile(markersInput, polyMap.setMarkers.bind(polyMap));
  readFile(polygonsInput, polyMap.setPolygons.bind(polyMap));
};

const enableTooltips = () => {
  const tooltipTriggerList = [].slice.call(tooltips);
  tooltipTriggerList.map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );
};

//listeners
document.addEventListener("DOMContentLoaded", enableTooltips);
drawBtn.addEventListener("click", drawPolygonsAndMarkers);
cleanBtn.addEventListener("click", polyMap.clean.bind(polyMap));
downloadBtn.addEventListener("click", downloadMarkersWithPolygons);
