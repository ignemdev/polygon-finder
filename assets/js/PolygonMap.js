class polygonMap {
    #_style = [
        {
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#f5f5f5"
                }
            ]
        },
        {
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#616161"
                }
            ]
        },
        {
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "color": "#f5f5f5"
                }
            ]
        },
        {
            "featureType": "administrative.land_parcel",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#bdbdbd"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#eeeeee"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#757575"
                }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#e5e5e5"
                }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#9e9e9e"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#ffffff"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#757575"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#dadada"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#616161"
                }
            ]
        },
        {
            "featureType": "road.local",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#9e9e9e"
                }
            ]
        },
        {
            "featureType": "transit.line",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#e5e5e5"
                }
            ]
        },
        {
            "featureType": "transit.station",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#eeeeee"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#c9c9c9"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#9e9e9e"
                }
            ]
        }
    ]
    #_map;
    #_markers = [];
    #_polygons = [];

    constructor(mapContainer) {
        this.initMap(mapContainer);
    }

    initMap(mapContainer) {
        this.#_map = new google.maps.Map(mapContainer, {
            zoom: 6,
            styles: this.#_style,
            disableDefaultUI: true,
            center: { lat: 18.5112853, lng: -69.8911881 }
        });

        this.setCurrentPosition();
    };

    cleanMap() {
        this.#_map.data.forEach(feature => this.#_map.data.remove(feature));
        this.#_markers.forEach(marker => marker.setMap(null));
        this.#_markers, this.#_polygons = [];
    };

    setCurrentPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { coords: { latitude, longitude } } = position;
                this.setCenter({ lat: latitude, lng: longitude });
                this.setZoom(15);
            });
        }
    }

    setCenter = (position) => this.#_map.setCenter(position)

    setZoom = (amount) => this.#_map.setZoom(amount);

    setPolygons(parsedGeojson) {
        this.#_map.data.addGeoJson(parsedGeojson);
        this.#_map.data.forEach(feature => {
            const polygon = new google.maps.Polygon({
                path: feature.getGeometry().getAt(0).getArray(),
                label: feature.j.name,
                description: feature.j.description || feature.j.desc
            });
            this.#_polygons.push(polygon);
        });
    };

    setMarkers(parsedJson) {
        this.setCenter(parsedJson[0].position);
        parsedJson.forEach(element => {
            const marker = new google.maps.Marker({
                position: element.position,
                map: this.#_map,
                title: element.name
            });
            this.#_markers.push(marker);
        });
    };

    getMarkers() {
        return this.#_markers.map(marker => {
            const isInside = polygon => google.maps.geometry.poly.containsLocation(marker.position, polygon);
            const polygonFound = this.#_polygons.find(isInside);
            return {
                name: marker.title,
                belongsTo: (polygonFound) ? polygonFound.label : 'NF',
                lat: marker.position.lat(),
                lng: marker.position.lng()
            }
        });
    };
}