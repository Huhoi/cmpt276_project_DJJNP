// List of markers on load
var markers = [
    {
        "timestamp": "SFU Burnaby",
        "latitude": "49.278059",
        "longitude": "-122.919883",
        "description": "On top of a mountain"
    },
    {
        "timestamp": "SFU Surrey",
        "latitude": "49.186940",
        "longitude": "-122.849895",
        "description": "Newer campus"
    },
    {
        "timestamp": "Metrotown",
        "latitude": "49.2276",
        "longitude": "-123.0076",
        "description": "Largest mall in BC"
    },
    {
        "timestamp": "Science World",
        "latitude": "49.2734",
        "longitude": "-123.1038",
        "description": "Tourist attraction"
    },
    {
        "timestamp": "YVR",
        "latitude": "49.1933",
        "longitude": "-123.1751",
        "description": "Vanouver International Airport"
    }
];

// Initialize map when page is loaded
function initMap() {
    // Edit map options and assign it to its HTML ID
    var options = {
        center: {lat: 49.278059, lng: -122.919883},
        zoom: 8
    };
    map = new google.maps.Map(document.getElementById("map"), options);

    // Load all markers on the map
    var infoWindow = new google.maps.InfoWindow();
    var lat_lng = new Array();
    var latLngBounds = new google.maps.LatLngBounds();
    for (let i = 0; i < markers.length; i++) {
        var sel = markers[i];
        var selLatLng = new google.maps.LatLng(sel.latitude, sel.longitude);
        lat_lng.push(selLatLng);
        var marker = new google.maps.Marker({
            position: selLatLng,
            map: map,
            title: sel.timestamp
        });

        latLngBounds.extend(marker.position);
        (function(marker, sel) {
            google.maps.event.addListener(marker, "click", function(e) {
                infoWindow.setContent(sel.timestamp);
                infoWindow.open(map, marker);
            });
        })(marker, sel);
    }

    // Routing stuff
    // NOTE TO SELF: Read documentation to find out what some of these things do
    var service = new google.maps.DirectionsService();

    // Loop to draw lines connecting all points
    for (let j = 0; j < lat_lng.length; j++) {
        if ((j + 1) < lat_lng.length) {
            var src = lat_lng[j];
            var dest = lat_lng[j+1];

            service.route({
                origin: src,
                destination: dest,
                // May be able to change mode of transportation
                travelMode: google.maps.DirectionsTravelMode.DRIVING
            }, function(result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    // Init path array
                    var path = new google.maps.MVCArray();
                    // Set the path stroke color
                    var poly = new google.maps.Polyline({
                        map: map,
                        strokeColor: '#8153f5'
                    });

                    poly.setPath(path);
                    for (let k = 0, len = result.routes[0].overview_path.length; k < len; k++) {
                        path.push(result.routes[0].overview_path[k]);
                    }
                }
            });
        }
    }
    console.log("WORKING??");

    map.fitBounds(latLngBounds);
}








// // Add a marker to the map
// function addMarker(location) {
//     return new google.maps.Marker({
//         position: location,
//         map: map
//     });
// }

// // Place marker on click location
// google.maps.event.addListener(map, "click", function(event) {
//     // Create marker and store in list
//     let m = addMarker(event.latLng);
//     markers.push(m);

//     // Print list in console
//     // NOTE: The markers are of type 'Marker' (https://developers.google.com/maps/documentation/javascript/reference/marker)
//     console.log("~~~~~~~~~~ CURRENT LIST ~~~~~~~~~~");
//     markers.forEach(print => {
//         console.log("Lat: " + print.getPosition().lat() + ", Lng: " + print.getPosition().lng());
//     });
// });




// // Test location at SFU Burnaby
// const marker1 = new google.maps.Marker({
//     position: {lat: 49.278059, lng: -122.919883},
//     map: map
// });

// const info1 = new google.maps.InfoWindow({
//     content: `<strong>SFU Burnaby Campus</strong>`
// });

// marker1.addListener("click", () => {
//     info1.open(map, marker1);
// });