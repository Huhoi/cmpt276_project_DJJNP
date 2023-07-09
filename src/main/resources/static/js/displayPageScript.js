function initMap() {
    var options = {
        center: {lat: 49.278059, lng: -122.919883},
        zoom: 8
    }

    map = new google.maps.Map(document.getElementById("map"), options);
}