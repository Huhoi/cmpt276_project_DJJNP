//////////////////////////
//   Global variables   //
//////////////////////////
var markers = [];
var selected = [];
let currentUser = document.getElementById("currentUser").value;
var currentMarker;
const dateInput = document.getElementById("displayDate");
document.getElementById('saveButton').addEventListener('click', saveEvent);


var rn = new Date();
console.log("LocaleTimeString: " + rn.toLocaleTimeString('en-US'));
rn.setMinutes(rn.getMinutes() + 30)
console.log("30 mins from now: " + rn.toLocaleTimeString('en-US'));

//////////////////////////////////////
//   Map initialization functions   //
//////////////////////////////////////

// ====================================================
// Make Google Maps JavaScript API call when page loads
// - Documentation: https://developers.google.com/maps/documentation/javascript/overview
function initMap() {
    // Edit map options and assign it to its HTML ID
    var options = {
        center: {lat: 49.278059, lng: -122.919883},
        zoom: 10
    };
    map = new google.maps.Map(document.getElementById("map"), options);
    console.log("NOTE: Map may not load if you refresh too frequently");

    // Load search box
    const input = document.getElementById("pac-input");
    const searchbox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    map.addListener("bounds_changed", () => {
        searchbox.setBounds(map.getBounds());
    });

    // // Load markers and routes from database
    initMarkers();

    // LISTENER: Search box
    searchbox.addListener("places_changed", () => {
        const places = searchbox.getPlaces();
        // Do nothing if no predictions found
        if (places.length == 0) { return; }

        places.forEach((place) => {
            if (!place.geometry || !place.geometry.location) {
                console.log("No geometry found");
                return;
            }

            // Create icon depending on location
            const icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            }

            // Create marker if prediction selected and display on list
            addByPlaceResult(place);

            // Regenerate routes and adjust view
            initRoutes();
        });
    });

    // LISTENER: Map click
    google.maps.event.addListener(map, "click", function(event) {
        // Create marker and display on list
        addByLatLng(event.latLng);

        initRoutes();
    });


    dateInput.addEventListener('change', () => {
        setMapOnAll(null);
        markers = [];
        selected = [];
        initMarkers();
    });
}

function setMapOnAll(nullMap) {
    for (let i = 0; i < selected.length; i++) {
        selected[i].setMap(nullMap);
      }
}

function formatDate(dateString) {
    // Split the input string into year, month, and day components
    const [year, month, day] = dateString.split('-');

    // Remove leading zeros from the month and day components
    const formattedMonth = Number(month).toString();
    const formattedDay = Number(day).toString();

    // Create a new string in "M/d/yyyy" format
    const formattedDate = `${formattedMonth}/${formattedDay}/${year}`;

    return formattedDate;
}

// ===================================================
// Fetches data from API and places markers on the map
// - Uses the fetch() function to access controller, which returns data
function initMarkers() {
    // Use the built-in JavaScript fetch method to convert Java data to JSON
    fetch('/api/event')
    .then(response => response.json())
    .then(data => {
        for (const i of data){
            console.log(i.date);
            if (i.uid == currentUser && i.date == formatDate(dateInput.value)){
                markers.push({
                    timestamp: i.eventName,
                    latitude: Number(i.latitude),
                    longitude: Number(i.longitude),
                });
            }
        }
        
        // Loop to initialize all markers that currently exist
        var coordList = new Array(); // Stores all latitude and longitudes as LatLng objects
        markers.forEach(marker => {
            coordList.push(new google.maps.LatLng(marker.latitude, marker.longitude));
            // Display marker on map
            selected.push(new google.maps.Marker({
                position: new google.maps.LatLng(marker.latitude, marker.longitude),
                map: map,
                title: marker.timestamp
            }));

            // Click on marker to reveal details
            (function(marker, selected) {
                google.maps.event.addListener(marker, "click", function(e) {
                    infoWindow.setContent(selected.timestamp);
                    infoWindow.open(map, marker);
                });
            })(marker, selected);  
        });

        // Generate routes while in fetch call
        initRoutes();
    })
    .catch(error => console.error('Error fetching locations', error));
}

// =========================================
// Builds routes between initialized markers
// - Documentation: https://developers.google.com/maps/documentation/javascript/directions
function initRoutes() {
    var service = new google.maps.DirectionsService(); // Google directions service for pathfinding
    var coordList = new Array(); // Stores all latitude and longitudes as LatLng objects
    markers.forEach(marker => {
        coordList.push(new google.maps.LatLng(marker.latitude, marker.longitude));
    });

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
    // Show all points on map
    resizeMap();
}

// ==========================
// Re-size/re-adjust map view
// - Uses farthest coordinate points to generate best view
function resizeMap() {
    var latLngBounds = new google.maps.LatLngBounds();
    markers.forEach(marker => {
        var lat = Number(marker.latitude);
        var lng = Number(marker.longitude);
        latLngBounds.extend(new google.maps.LatLng(lat, lng));
    });
    map.fitBounds(latLngBounds);
    console.table(markers);
}

//

// ===========================================
// Places a marker on the map and adds to list
// - IF TYPE == google.maps.LatLng
// - Documentation: https://developers.google.com/maps/documentation/javascript/reference/coordinates#LatLng
function addByLatLng(newMarker) {
    // Display new marker on the map
    new google.maps.Marker({
        position: newMarker,
        map: map
    });

    // Marker details
    marker = {
        "timestamp": "New event", // TO-DO
        "latitude": Number(newMarker.lat()),
        "longitude": Number(newMarker.lng()),
    }

    markers.push(marker); // Add to JS list
    addToList(marker); // Add to HTML list
    currentMarker = marker;
    // document.getElementById("markerForm").submit(); // Send data to DB (runs saveMarker() on submit)

    return marker;
}

// ===========================================
// Places a marker on the map and adds to list
// - IF TYPE == google.maps.places.PlaceResult
// - Documentation: https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult
function addByPlaceResult(newMarker) {
    // Display new marker on the map
    new google.maps.Marker({
        position: newMarker.geometry.location,
        map: map
    });

    // Marker details
    marker = {
        "timestamp": newMarker.name,
        "latitude": newMarker.geometry.location.lat(),
        "longitude": newMarker.geometry.location.lng(),
    }

    markers.push(marker); // Add to JS list
    addToList(marker); // Add to HTML list
    currentMarker = marker;
    // document.getElementById("markerForm").submit(); // Send data to DB (runs saveMarker() on submit)

    return marker;
}

// ==================================
// Helper function for adding to list
function addToList(newMarker) {
    var table = document.getElementById("list");
    var row = table.insertRow(1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    cell1.innerHTML = newMarker.timestamp;
    cell2.innerHTML = newMarker.latitude;
    cell3.innerHTML = newMarker.longitude;
}

// =============================================
// Helper function for adding marker to database
async function saveMarker(event) {
    event.preventDefault();
    var timeNow = new Date();
    var timeLater = new Date();
    timeLater.setMinutes(timeNow.getMinutes() + 30);

    document.getElementById("markerTitle").value = currentMarker.timestamp;
    document.getElementById("markerLat").value = currentMarker.latitude;
    document.getElementById("markerLng").value = currentMarker.longitude;

    const eventData = {
        eventName: "New event",
        latitude: currentMarker.latitude,
        longitude: currentMarker.longitude,
        date: timeNow.toLocaleDateString('en-US'),
        timeBegin: 1800,
        timeEnd: 1830,
        // timeBegin: timeNow.toLocaleTimeString('en-US'),
        // timeEnd: timeLater.toLocaleTimeString('en-US'),
        uid: currentUser,
    };

    // Use fetch() to add to database
    try {
        const response = await fetch('/api/display/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
        });

        // If saving is not successful, 
        if (!response.ok) {
            console.error('Failed to save event: ', response.status);
        }
    }
    catch (error) {
        console.error('Error saving event: ', error);
    }

    console.log("DONE RUNNING saveMarker()");
}










