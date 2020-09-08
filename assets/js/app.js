//map init
const polyMap = (screen.width >= 992) ? new polygonMap(document.querySelector('#map')) : null;

const drawBtn = document.querySelector('#draw-btn'),
    downloadBtn = document.querySelector('#download-btn'),
    polygonsInput = document.querySelector('#polygons-input'),
    markersInput = document.querySelector('#markers-input');

const downloadMarkers = e => {
    const dataURL = `data:application/json,${JSON.stringify(polyMap.getMarkers())}`;
    downloadBtn.setAttribute("download", "Markers.json");
    downloadBtn.setAttribute("href", dataURL);
}

const readFile = (input, drawFunction) => {
    const fileReader = new FileReader();
    fileReader.onload = e => polyMap[drawFunction](JSON.parse(e.target.result));
    fileReader.readAsText(input.files[0]);
}

const drawPolysAndMarkers = e => {
    polyMap.cleanMap();
    readFile(markersInput, 'setMarkers');
    readFile(polygonsInput, 'setPolygons');
}

downloadBtn.addEventListener('click', downloadMarkers);

drawBtn.addEventListener('click', drawPolysAndMarkers);
