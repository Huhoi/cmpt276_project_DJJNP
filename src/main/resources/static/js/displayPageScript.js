// List of markers on load
var markers = [];

// Initialize map when page is loaded
function initMap() {
    // Edit map options and assign it to its HTML ID
    var options = {
        center: {lat: 49.278059, lng: -122.919883},
        zoom: 8
    }
    map = new google.maps.Map(document.getElementById("map"), options);

    // Place marker on click location
    google.maps.event.addListener(map, "click", function(event) {
        // Create marker and store in list
        let m = addMarker(event.latLng);
        markers.push(m);

        // Print list in console
        // NOTE: The markers are of type 'Marker' (https://developers.google.com/maps/documentation/javascript/reference/marker)
        console.log("~~~~~~~~~~ CURRENT LIST ~~~~~~~~~~");
        markers.forEach(print => {
            console.log("Lat: " + print.getPosition().lat() + ", Lng: " + print.getPosition().lng());
        });
    });

    // Load all markers on the map
    markers.forEach(marker => {
        new google.maps.Marker({
            position: marker.getPosition().lat(),
            map: marker.getPosition().lng()
        })
    });
}

// Add a marker to the map
function addMarker(location) {
    return new google.maps.Marker({
        position: location,
        map: map
    });
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