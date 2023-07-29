////////////////////////////////////////
//   Global variables and listeners   //
////////////////////////////////////////
var map; // google.maps.Map
var paths = []; // List of paths
var markers = []; // List of markers fetched from DB
var selected = []; // List of google.maps.Marker objects
var polylines = []; // List of google.maps.Polyline objects
var currentMarker; // Used for saving markers to DB
var timeInterval = 0; // Prevent time-collisions
var searchbox;
var firstInit = 0;
var markerCount = 0;
var currentUser = document.getElementById("currentUser").value; // UID
const dateInput = document.getElementById("displayDate"); // HTML calendar input
document.getElementById('saveButton').addEventListener('click', saveMarker); // !!! TEMPORARY !!! 


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

    // Load search box
    const input = document.getElementById("pac-input");
    searchbox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    map.addListener("bounds_changed", () => {
        searchbox.setBounds(map.getBounds());
    });

    initListeners();
}

// =====================================================
// Load listeners for searchbox, clicks, and date change
function initListeners() {
    // Load markers and routes from database
    initMarkers();

    // LISTENER: Map click
    google.maps.event.addListener(map, "click", function(event) {
        // Create marker and display on list
        addByLatLng(event.latLng);
        console.log("clicking");

        initRoutes();
    });

    // LISTENER: Search box
    searchbox.addListener("places_changed", () => {
        const places = searchbox.getPlaces();
        // Do nothing if no predictions found
        if (places.length == 0) { return; }

        places.forEach((place) => {
            if (!place.geometry || !place.geometry.location) {
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

    // Listen for changes to the HTML calendar: refresh map if changed
    // NOTE: Only do this for the first init, otherwise there will be unintended
    //       "event bubbling" from calls to initListeners() caused by setMapOnAll().
    if (firstInit == 0) {
        dateInput.addEventListener('change', () => {
            console.log("DATE CHANGED");
            firstInit++;
            markerCount = markers.length;
            markers = [];
            setMapOnAll(null);
        });
    }
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
            // Only push markers if UID and date matches
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
                    // Generate random color for polyline
                    var color = polylineColor();

                    path = new google.maps.MVCArray();
                    polyline = new google.maps.Polyline({
                        map: map,
                        strokeColor: color
                    });

                    // Assign the path between markers to the polyline
                    polyline.setPath(path);
                    for (let k = 0, len = result.routes[0].overview_path.length; k < len; k++) {
                        path.push(result.routes[0].overview_path[k]);
                    }
                    paths.push(path);
                    polylines.push(polyline);
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
    // Edge case: If no markers exist, then focus view on Vancouver
    var latLngBounds = new google.maps.LatLngBounds();
    if (markers.length == 0) {
        latLngBounds.extend(new google.maps.LatLng(49.278059, -122.919883));
    }
    else {
        markers.forEach(marker => {
            var lat = Number(marker.latitude);
            var lng = Number(marker.longitude);
            latLngBounds.extend(new google.maps.LatLng(lat, lng));
        });
        map.fitBounds(latLngBounds);
    }
}

// ===========================================
// Places a marker on the map and adds to list
// - IF TYPE == google.maps.LatLng
// - Documentation: https://developers.google.com/maps/documentation/javascript/reference/coordinates#LatLng
function addByLatLng(newMarker) {
    // Marker details
    marker = {
        "timestamp": "New event", // TO-DO
        "latitude": Number(newMarker.lat()),
        "longitude": Number(newMarker.lng()),
    }

    // Display new marker on the map
    selected.push(new google.maps.Marker({
        position: newMarker,
        map: map,
        title: marker.timestamp
    }));

    markers.push(marker); // Add to JS list
    addToHtmlList(marker); // Add to HTML list
    currentMarker = marker;

    return marker;
}

// ===========================================
// Places a marker on the map and adds to list
// - IF TYPE == google.maps.places.PlaceResult
// - Documentation: https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult
function addByPlaceResult(newMarker) {
    // Marker details
    marker = {
        "timestamp": newMarker.name,
        "latitude": newMarker.geometry.location.lat(),
        "longitude": newMarker.geometry.location.lng(),
    }

    // Display new marker on the map
    selected.push(new google.maps.Marker({
        position: newMarker.geometry.location,
        map: map,
        title: marker.timestamp
    }));

    markers.push(marker); // Add to JS list
    addToHtmlList(marker); // Add to HTML list
    currentMarker = marker;

    return marker;
}

// ==================================
// Helper function for adding to list
function addToHtmlList(newMarker) {
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
    // Prevents page from refreshing
    event.preventDefault();

    document.getElementById("markerTitle").value = currentMarker.timestamp;
    document.getElementById("markerLat").value = currentMarker.latitude;
    document.getElementById("markerLng").value = currentMarker.longitude;

    const eventData = {
        eventName: "New event",
        latitude: currentMarker.latitude,
        longitude: currentMarker.longitude,
        date: formatDate(dateInput.value),
        timeBegin: formatTime("now"),
        timeEnd: formatTime("later"),
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

// ========================================================
// Helper function for resetting markers on calendar change
function setMapOnAll(nullMap) {
    // Clear all markers
    for (let i = 0; i < selected.length; i++) {
        selected[i].setMap(nullMap);
    }

    // Clear all routes
    polylines.forEach(polyline => {
        polyline.setMap(null);
    });
    if (path) {
        path.clear();
    }

    initListeners();
}

// ================================================
// Converts from HTML calendar format to our format
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

// ==================================================
// Converts Date() output to database-compatible time
function formatTime(when) {
    // Get local time
    var newTime = 0;
    var timeNow = new Date();
    var timeLater = new Date();
    timeLater.setMinutes(timeNow.getMinutes() + timeInterval + 30);
    timeNow.setMinutes(timeNow.getMinutes() + timeInterval);
    timeInterval += 30; // Increment by 30 mins
    
    // Get current time
    if (when == "now") {
        newTime += timeNow.getHours() * 100;
        newTime += timeNow.getMinutes();
    }
    // Get time later
    else {
        newTime += timeLater.getHours() * 100;
        newTime += timeLater.getMinutes();
    }

    console.log(newTime);
    return newTime;
}

// ==================================================
// Pick a random color in the form of a hex (#XXXXXX)
// - Exclude 'D', 'E', 'F' for GREEN colors -- colors become too bright
//   and the prevalence of green makes the polylines blend in with the map.
function polylineColor() {
    // All 16 hex colors (minus some for green)
    var letters = '0123456789ABCDEF'; // 16
    var gLetters = '0123456789ABC'; // 13
    var hex = '#';

    // R: Red
    for (let i = 0; i < 2; i++) {
        hex += letters[Math.floor(Math.random() * 16)];
    }

    // G: Green
    for (let j = 0; j < 2; j++) {
        hex += gLetters[Math.floor(Math.random() * 13)]
    }

    // B: Blue
    for (let k = 0; k < 2; k++) {
        hex += letters[Math.floor(Math.random() * 16)];
    }

    return hex;
}






