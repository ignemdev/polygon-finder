class polygonMap {
  #_map;
  #_markers = [];
  #_polygons = [];
  #_defaultZoom = 15;
  #_defaultCenter = [18.5112853, -69.8911881];

  constructor(mapContainer) {
    this.initMap(mapContainer);
  }

  initMap(mapContainer) {
    this.#_map = L.map(mapContainer, {
      center: this.#_defaultCenter,
      zoom: 6,
    });

    L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
      }
    ).addTo(this.#_map);

    this.setCurrentPosition();
  }

  setCenter = (latLang) => this.#_map.setView(latLang, this.#_defaultZoom);

  setZoom = (amount) => this.#_map.setZoom(amount);

  setCurrentPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const {
          coords: { latitude, longitude },
        } = position;
        this.setCenter([latitude, longitude]);
        this.setZoom(this.#_defaultZoom);
      });
    }
  }

  setPolygons(parsedGeojson) {
    const geojsonLayer = L.geoJSON(parsedGeojson, {
      onEachFeature: (feature, layer) => {
        layer.bindPopup(feature.properties.name).openPopup();
        layer.setStyle({ color: "#6c757d" });
      },
    }).addTo(this.#_map);

    this.#_polygons = [...geojsonLayer.getLayers()];
  }

  setMarkers(parsedJson) {
    this.setCenter(parsedJson[0].position);
    const icon = L.icon({
      iconUrl: "assets/images/marker-icon-red.png",
      iconAnchor: [12.5, 41],
    });
    parsedJson.forEach((element) => {
      const marker = L.marker(element.position, { icon, title: element.name })
        .addTo(this.#_map)
        .bindPopup(element.name)
        .openPopup();
      this.#_markers.push(marker);
    });
  }

  getMarkersWithPolygons() {
    if (this.#_markers.length <= 0 || this.#_polygons.length <= 0) return;

    const markersWithPolygons = this.#_markers.map((marker) => {
      const { lat, lng } = marker.getLatLng();
      const polygonFound = this.#_polygons.find((polygon) =>
        turf.booleanPointInPolygon([lng, lat], polygon.feature.geometry)
      );
      const markersWithPolygon = {
        name: marker.options.title,
        belongsTo: polygonFound ? polygonFound.feature.properties.name : "NF",
        lat,
        lng,
      };
      return markersWithPolygon;
    });
    return markersWithPolygons;
  }

  cleanMap() {
    this.#_map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.GeoJSON)
        this.#_map.removeLayer(layer);
    });
    this.#_markers = [];
    this.#_polygons = [];
  }
}

export default polygonMap;
