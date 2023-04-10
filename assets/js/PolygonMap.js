class polygonMap {
  #_map;
  #_markers = [];
  #_polygons = [];

  constructor(mapContainer) {
    this.initMap(mapContainer);
  }

  initMap(mapContainer) {
    this.#_map = L.map(mapContainer, {
      center: [18.5112853, -69.8911881],
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

  cleanMap() {
    this.#_map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.GeoJSON)
        this.#_map.removeLayer(layer);
    });
    this.#_markers, (this.#_polygons = []);
  }

  setCurrentPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const {
          coords: { latitude, longitude },
        } = position;
        this.setCenter([latitude, longitude]);
        this.setZoom(15);
      });
    }
  }

  setCenter = (latLang) => this.#_map.setView(latLang, 15);

  setZoom = (amount) => this.#_map.setZoom(amount);

  setPolygons(parsedGeojson) {
    const geojsonLayer = L.geoJSON(parsedGeojson, {
      onEachFeature: (feature, layer) => {
        layer.bindPopup(feature.properties.name).openPopup();
        layer.setStyle({ color: "#6c757d" });
      },
    }).addTo(this.#_map);

    const polygons = geojsonLayer.getLayers();
    this.#_polygons.push(polygons);
  }

  setMarkers(parsedJson) {
    this.setCenter(parsedJson[0].position);
    const icon = L.icon({ iconUrl: "assets/images/marker-icon-red.png" });
    parsedJson.forEach((element) => {
      const marker = L.marker(element.position, { icon })
        .addTo(this.#_map)
        .bindPopup(element.name)
        .openPopup();
      this.#_markers.push(marker);
    });
  }

  getMarkers() {
    return this.#_markers.map((marker) => {
      const isInside = (polygon) =>
        google.maps.geometry.poly.containsLocation(marker.position, polygon);
      const polygonFound = this.#_polygons.find(isInside);
      return {
        name: marker.title,
        belongsTo: polygonFound ? polygonFound.label : "NF",
        lat: marker.position.lat(),
        lng: marker.position.lng(),
      };
    });
  }
}
