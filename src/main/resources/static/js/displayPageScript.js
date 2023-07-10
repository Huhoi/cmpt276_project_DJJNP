// Initialize map when page is loaded
function initMap() {
    var options = {
        center: {lat: 49.278059, lng: -122.919883},
        zoom: 8
    }

    map = new google.maps.Map(document.getElementById("map"), options);

    // Place marker on click location
    google.maps.event.addListener(map, "click", function(event) {
        addMarker(event.latLng);
    });

    // Test location at SFU Burnaby
    const marker1 = new google.maps.Marker({
        position: {lat: 49.278059, lng: -122.919883},
        map: map
    });

    const info1 = new google.maps.InfoWindow({
        content: `<strong>SFU Burnaby Campus</strong>`
    });

    marker1.addListener("click", () => {
        info1.open(map, marker1);
    });    
}

// Add a marker to the map
function addMarker(location) {
    var m = new google.maps.Marker({
        position: location,
        map: map
    });
}
