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
    console.log("NOTE: Map may not load if you refresh too frequently");

    // Place marker on click location
    google.maps.event.addListener(map, "click", function(event) {
        // Create marker and store in list
        // NOTE: The markers are of type 'Marker' (https://developers.google.com/maps/documentation/javascript/reference/marker)
        let marker = addMarker(event.latLng);
        markers.push(marker);

        // Display route after marker added
        var table = document.getElementById("list");
        var row = table.insertRow(1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        cell1.innerHTML = marker.timestamp;
        cell2.innerHTML = marker.latitude;
        cell3.innerHTML = marker.longitude;
        cell4.innerHTML = marker.description;

        document.getElementById("timestampInput").value = marker.timestamp;
        document.getElementById("latitudeInput").value = marker.latitude;
        document.getElementById("longitudeInput").value = marker.longitude;
        document.getElementById("descriptionInput").value = marker.description;

        // Reload to show routes
        reloadMap();
    });

    // Load markers and routes
    reloadMap();

    // Create list with existing markers
    markers.forEach(marker => {
        var table = document.getElementById("list");
        var row = table.insertRow(1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        cell1.innerHTML = marker.timestamp;
        cell2.innerHTML = marker.latitude;
        cell3.innerHTML = marker.longitude;
        cell4.innerHTML = marker.description;


    });
}


function reloadMap() {
    // Load all markers on the map
    var coordList = new Array(); // Stores all latitude and longitudes in the form of a LatLng object
    var infoWindow = new google.maps.InfoWindow(); // The window that pops up when you click a marker
    var latLngBounds = new google.maps.LatLngBounds(); // Used to automatically resize map
    // Loop to initialize all markers that currently exist
    for (let i = 0; i < markers.length; i++) {
        var sel = markers[i];
        var selLatLng = new google.maps.LatLng(sel.latitude, sel.longitude);
        coordList.push(selLatLng);
        var marker = new google.maps.Marker({
            position: selLatLng,
            map: map,
            title: sel.timestamp
        });

        // Click on marker to reveal details
        (function(marker, sel) {
            google.maps.event.addListener(marker, "click", function(e) {
                infoWindow.setContent(sel.timestamp);
                infoWindow.open(map, marker);
            });
        })(marker, sel);

        // Auto-adjust the map to show all markers
        latLngBounds.extend(marker.position);
    }

    // Routing stuff
    // Implement the Google directions service to help with pathfinding
    var service = new google.maps.DirectionsService();
    // Loop to draw lines connecting all points
    for (let j = 0; j < coordList.length; j++) {
        if ((j + 1) < coordList.length) {
            // TEMPORARY: We route the previous marker in the array with the next
            var src = coordList[j];
            var dest = coordList[j+1];
            // Call upon the directions service to get paths given an origin and a
            // destination. Can adjust mode of transportation via the travelMode field.
            service.route({
                origin: src,
                destination: dest,
                travelMode: google.maps.DirectionsTravelMode.DRIVING // DRIVING, BYCYCLING, TRANSIT, WALKING
            },
            // Function checks if a response was received from the API call, and
            // proceeds to create a path between the two given points
            function(result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    var path = new google.maps.MVCArray();
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
    // Auto-adjust the map to show all markers
    map.fitBounds(latLngBounds);
}



// Add a marker to the map
function addMarker(newMarker) {
    // Create new marker
    new google.maps.Marker({
        position: newMarker,
        map: map
    });

    // Return marker details
    return {
        "timestamp": "New marker",
        "latitude": newMarker.lat(),
        "longitude": newMarker.lng(),
        "description": "Add description"
    };
}








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