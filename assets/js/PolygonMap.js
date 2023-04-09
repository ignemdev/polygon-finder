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

    // this.#_map = new google.maps.Map(mapContainer, {
    //   zoom: 6,
    //   styles: this.#_style,
    //   disableDefaultUI: true,
    //   center: { lat: 18.5112853, lng: -69.8911881 },
    // });

    this.setCurrentPosition();
  }

  cleanMap() {
    this.#_map.data.forEach((feature) => this.#_map.data.remove(feature));
    this.#_markers.forEach((marker) => marker.setMap(null));
    this.#_markers, (this.#_polygons = []);
  }

  setCurrentPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const {
          coords: { latitude, longitude },
        } = position;
        this.setCenter({ lat: latitude, lng: longitude });
        this.setZoom(15);
      });
    }
  }

  setCenter = ({ lat, lng }) => this.#_map.setView([lat, lng], 0);

  setZoom = (amount) => this.#_map.setZoom(amount);

  setPolygons(parsedGeojson) {
    this.#_map.data.addGeoJson(parsedGeojson);
    this.#_map.data.forEach((feature) => {
      const polygon = new google.maps.Polygon({
        path: feature.getGeometry().getAt(0).getArray(),
        label: feature.j.name,
        description: feature.j.description || feature.j.desc,
      });
      this.#_polygons.push(polygon);
    });
  }

  setMarkers(parsedJson) {
    this.setCenter(parsedJson[0].position);
    parsedJson.forEach((element) => {
      const marker = new google.maps.Marker({
        position: element.position,
        map: this.#_map,
        title: element.name,
      });
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
