////////////////////////////////////////
//   Global variables and listeners   //
////////////////////////////////////////

var map; // google.maps.Map
var searchbox; // google.maps.places.SearchBox
var path;
var paths = []; // List of paths (for routing)
var markers = []; // List of markers fetched from DB
var selected = []; // List of google.maps.Marker objects
var polylines = []; // List of google.maps.Polyline objects
var currentMarker; // Used for saving markers to DB
var maxSid = 0; // Keeps track of the greatest SID value
var maxBegin = 0; // Keeps track of the latest start time
var minBegin = 2359;
var firstInit = 0;
var currentUser; // Used to obtain UID
var dateInput; // HTML calendar input



//////////////////////////////////////
//   Map initialization functions   //
//////////////////////////////////////

// ====================================================
// Make Google Maps JavaScript API call when page loads
// - Runs when map initializes for the first time-- callback from API inside HTML
// - Documentation: https://developers.google.com/maps/documentation/javascript/overview
function initMap() {
    // Initialize some global variables onload
    currentUser = document.getElementById("currentUser").value;
    dateInput = document.getElementById("displayDate");

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

    // Set correct date upon init
    var timePST = new Date();
    dateInput.value = timePST.toDateInputValue();

    // Now load listeners for map functionality
    initListeners();
}

// =====================================================
// Load listeners for searchbox, clicks, and date change
function initListeners() {
    // Load markers and routes from database
    initMarkers();

    // NOTE: Only initialize listeners on first init, otherwise there'll be unintended
    //       "event bubbling" from calls to initListeners() caused by resetMap().
    if (firstInit == 0) {
        firstInit++;
        // LISTENER: Map click
        google.maps.event.addListener(map, "click", function(event) {
            // Create marker and display on list
            addByLatLng(event.latLng);

            // Regenerate routes and adjust view
            initRoutes();
            document.getElementById("saveButton").click();
        });

        // LISTENER: Search box
        searchbox.addListener("places_changed", () => {
            const places = searchbox.getPlaces();
            // Do nothing if no predictions found
            if (places.length == 0) { return; }

            places.forEach((place) => {
                // If geometry cannot be accessed, return
                if (!place.geometry || !place.geometry.location) {
                    return;
                }

                // Create marker if prediction selected and display on list
                addByPlaceResult(place);

                // Regenerate routes and adjust view
                initRoutes();
                document.getElementById("saveButton").click();
            });
        });

        // Listen for changes to the HTML calendar: refresh map if changed
        dateInput.addEventListener('change', () => {
            resetMap(null);
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
            // Update max SID (consider ALL dates)
            if (i.sid > maxSid) { maxSid = i.sid; }
            // Only push markers if UID and date matches
            if (i.uid == currentUser && i.date == getDate(dateInput.value)){
                markers.push({
                    timestamp: i.eventName,
                    begin: i.timeBegin,
                    end: i.timeEnd,
                    latitude: Number(i.latitude),
                    longitude: Number(i.longitude),
                    sid: i.sid
                });
                // Update max begin time
                if (i.timeBegin > maxBegin) { maxBegin = i.timeBegin; }
                // Update min begin time
                if (i.timeBegin < minBegin) { minBegin = i.timeBegin; }
            }
        }

        // Sort the received markers by start time (descending)
        markers.sort((a, b) => {
            if (b.begin !== a.begin) {
                // Sort by timeBegin first
                return b.begin - a.begin;
            } else {
                // If timeBegin values are equal, sort by timeEnd
                return b.end - a.end;
            }
        });
        
        // If there are markers for the selected day:
        if (markers.length > 0) {
            // Show list and hide error message
            document.getElementById("list").style.visibility = "visible";
            document.getElementById("noMarkers").style.color = "black";
            document.getElementById("noMarkers").innerHTML = "Showing markers for " + dateInput.value;
            
            // Loop to initialize all markers that currently exist
            var coordList = new Array(); // Stores all latitude and longitudes as LatLng objects
            markers.forEach(marker => {
                coordList.push(new google.maps.LatLng(marker.latitude, marker.longitude));
                // Display marker on map
                var markerObj = new google.maps.Marker({
                    position: new google.maps.LatLng(marker.latitude, marker.longitude),
                    map: map,
                    title: marker.timestamp,
                    clickable: true
                });
                selected.push(markerObj);

                // Click on marker to reveal details
                var infoWindow = new google.maps.InfoWindow({
                    content: markerObj.title
                });

                // Add event listener for click
                google.maps.event.addListener(markerObj, 'click', function() {
                    console.log("markerObj.title: " + markerObj.title)
                    infoWindow.open(map, markerObj);
                });

                // Place each marker in HTML list
                addToHtmlList(marker);
            });

            // Generate routes while in fetch call
            initRoutes();
        }
        
        // Else if no markers for selected day:
        else {
            // Give feedback that there are no markers
            document.getElementById("list").style.visibility = "hidden";
            document.getElementById("noMarkers").innerHTML = "No markers found on " + dateInput.value;
        }
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

    console.table(markers);
}



/////////////////////////////////////////////
//   Map manipulation & helper functions   //
/////////////////////////////////////////////

// ===========================================
// Places a marker on the map and adds to list
// - IF TYPE == google.maps.LatLng
// - Documentation: https://developers.google.com/maps/documentation/javascript/reference/coordinates#LatLng
function addByLatLng(newMarker) {
    console.log("ADDING BY LATLNG")
    // Edge case: Adding first marker for selected date
    document.getElementById("list").style.visibility = "visible";
    document.getElementById("noMarkers").innerHTML = "Showing markers for " + dateInput.value;

    // Get default values for time
    var now = militaryTime("now");
    var later = militaryTime("later");

    // Let user edit event with alert prompts
    console.log(newMarker.name)
    var prompts = showPrompts(newMarker.name, now, later);

    // Marker details
    maxSid++;
    marker = {
        "timestamp": prompts[0],
        "latitude": Number(newMarker.lat()),
        "longitude": Number(newMarker.lng()),
        "begin": prompts[1],
        "end": prompts[2],
        "sid": maxSid
    };

    // Display new marker on the map
    var markerObj = new google.maps.Marker({
        position: new google.maps.LatLng(marker.latitude, marker.longitude),
        map: map,
        title: marker.timestamp,
        clickable: true
    });
    selected.push(markerObj);

    // Click on marker to reveal details
    var infoWindow = new google.maps.InfoWindow({
        content: markerObj.title
    });

    // Add event listener for click
    google.maps.event.addListener(markerObj, 'click', function() {
        console.log("markerObj.title: " + markerObj.title)
        infoWindow.open(map, markerObj);
    });

    markers.push(marker); // Add to JS list
    addToHtmlList(marker); // Add to HTML list
    currentMarker = marker;

    // If event time is between other events, rearrange-- refresh markers
    console.log("min: " + minBegin)
    console.log("max: " + maxBegin)
    if (marker.begin < maxBegin && marker.begin > minBegin) {
        console.log("REARRANGING MARKERS...");
        resetMap();
    }

    return marker;
}

// ===========================================
// Places a marker on the map and adds to list
// - IF TYPE == google.maps.places.PlaceResult
// - Documentation: https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult
function addByPlaceResult(newMarker) {
    // Edge case: Adding first marker for selected date
    document.getElementById("list").style.visibility = "visible";
    document.getElementById("noMarkers").innerHTML = "Showing markers for " + dateInput.value;

    // Get default values for time
    var now = militaryTime("now");
    var later = militaryTime("later");

    // Let user edit event with alert prompts
    var prompts = showPrompts(newMarker.name, now, later);

    // Marker details
    maxSid++;
    marker = {
        "timestamp": prompts[0],
        "latitude": newMarker.geometry.location.lat(),
        "longitude": newMarker.geometry.location.lng(),
        "begin": prompts[1],
        "end": prompts[2],
        "sid": maxSid
    };

    // Display new marker on the map
    var markerObj = new google.maps.Marker({
        position: new google.maps.LatLng(marker.latitude, marker.longitude),
        map: map,
        title: marker.timestamp,
        clickable: true
    });
    selected.push(markerObj);

    // Click on marker to reveal details
    var infoWindow = new google.maps.InfoWindow({
        content: markerObj.title
    });

    // Add event listener for click
    google.maps.event.addListener(markerObj, 'click', function() {
        infoWindow.open(map, markerObj);
    });

    markers.push(marker); // Add to JS list
    addToHtmlList(marker); // Add to HTML list
    currentMarker = marker;

    // If event time is between other events, rearrange-- refresh markers
    if (marker.begin < maxBegin && marker.begin > minBegin) {
        console.log("REARRANGING MARKERS...");
        resetMap();
    }

    return marker;
}

// ========================================================
// Helper function for resetting markers on calendar change
function resetMap(nullMap) {
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

    maxSid = 0;
    clearHtmlList();
    markers = [];
    initListeners();
}



////////////////////////////////////////
//   Database interaction functions   //
////////////////////////////////////////

// =============================================
// Helper function for adding marker to database
async function saveMarker(event) {
    // Prevents page from refreshing
    event.preventDefault();

    // Grab data from currentMarker and POST
    const eventData = {
        eventName: currentMarker.timestamp,
        latitude: currentMarker.latitude,
        longitude: currentMarker.longitude,
        date: getDate(dateInput.value),
        timeBegin: currentMarker.begin,
        timeEnd: currentMarker.end,
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
}

// ================================================
// Function to delete item from the list of markers
// - Deletes events using fetch call with DELETE method
function deleteMarker(sid) {
    // Fetches backend controller to delete
    fetch(`/api/${sid}`, {
        method: 'DELETE'
    })
        .then(response => {
  
        // Event deleted successfully
        if (response.ok) {
            markers = markers.filter(event => event.sid !== sid);
          
            // Refreshes all things (Map, Route, Listeners, etc)
            console.log("Delete success")
            resetMap();
        }
        else {
            console.error('Error deleting event');
            document.getElementById("noMarkers").style.visibility = "visible";
            document.getElementById("noMarkers").style.color = "red";
            document.getElementById("noMarkers").innerHTML = "Error deleting event " + sid + ". Please refresh and try again.";
        }
    })
    .catch(error => console.error('Error deleting event', error));
}



///////////////////////////////
//   Date & time functions   //
///////////////////////////////

// ================================================
// Converts from HTML calendar format to our format
function getDate(dateString) {
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
// - Pass "now" or "later" to get military time
function militaryTime(when) {
    // Get local time
    var newTime = 0; // Stores in military time format
    var timeNow = new Date();
    var timeLater = new Date();
    timeLater.setMinutes(timeNow.getMinutes() + 60);
    timeNow.setMinutes(timeNow.getMinutes());
    
    // Get current time
    if (when == "now") {
        newTime += timeNow.getHours() * 100;
        newTime += timeNow.getMinutes();
    }
    // Get time later
    else if (when == "later") {
        newTime += timeLater.getHours() * 100;
        newTime += timeLater.getMinutes();
    }

    return newTime;
}

// =============================================
// Helps with initializing HTML schedule element
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

// =======================================================
// Converts time from military (24-hour) to 12-hour format
// - Derived from calendarPageScript.js
function convertTo12HourFormat(militaryTime) {
    const hours = Math.floor(militaryTime / 100);
    const minutes = militaryTime % 100;
    const ampm = hours >= 12 ? 'pm' : 'am';
  
    let formattedHours = hours % 12;
    formattedHours = formattedHours === 0 ? 12 : formattedHours;
  
    const formattedMinutes = minutes.toString().padStart(2, '0');
  
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

// ================================================
// Checks if an integer is in valid military format 
function timeChecker(check) {
    // Re-run loop if any of these contradictions apply
    if (check == null || isNaN(check) || check > 2359 || check < 0 || check % 100 >= 60) {
        return true;
    }

    // If all cases don't pass, stop loop
    return false;
}



////////////////////////////////
//   Other helper functions   //
////////////////////////////////

// ==========================================================
// Display prompts for setting name, start time, and end time
function showPrompts(name, begin, end) {
    // Array of prompt results (Format: name, begin, end)
    var prompts = [];

    // Name of the event
    // If name exists, use it-- otherwise use placeholder
    name = name ? name : 'Event ' + maxSid;
    prompts[0] = window.prompt("New name event (Default: '" + name + "')", name);

    // Starting time of the event
    // Use current time if value not modified-- otherwise use chosen time
    while (timeChecker(prompts[1])) {
        prompts[1] = window.prompt("Starting time in military format (Default: " + begin + ")", begin);
        prompts[1] = prompts[1] == begin ? begin : prompts[1];
        prompts[1] = parseInt(prompts[1]);
    }

    // Ending time of the event
    // Use time in 30 mins if value not modified-- otherwise use chosen time
    while (timeChecker(prompts[2]) || prompts[2] < prompts[1]) {
        prompts[2] = window.prompt("Ending time in military format (Default: " + end + ")", end);
        prompts[2] = prompts[2] == end ? end : prompts[2];
        prompts[2] = parseInt(prompts[2]);
    }

    return prompts;
}

// ==================================
// Helper function for adding to list
function addToHtmlList(newMarker) {
    // Create rows/cells on table
    var table = document.getElementById("list");
    var row = table.insertRow(1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);

    // Assign the row its SID
    row.setAttribute("id", `${newMarker.sid}`);
    
    // Add data to HTML list
    cell1.innerHTML = newMarker.timestamp;
    cell2.innerHTML = convertTo12HourFormat(newMarker.begin);
    cell3.innerHTML = convertTo12HourFormat(newMarker.end);
    cell4.innerHTML = newMarker.latitude;
    cell5.innerHTML = newMarker.longitude;

    // Delete Button
    const cell6 = row.insertCell(5); // Delete Button
    const deleteButton = document.createElement('button');
    cell6.setAttribute("style", "text-align: center;")
    deleteButton.classList.add("btn");
    deleteButton.classList.add("btn-danger");
    deleteButton.setAttribute("style", "width: 60%;")
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteMarker(newMarker.sid));
    cell6.appendChild(deleteButton);
}


// ==================================
// Helper function for clearing list
function clearHtmlList() {
    var table = document.getElementById("list");
    var size = table.rows.length-1;
    console.log(size);

    if (size == 0) {
        return;
    }

    for (let i = 0; i < size; i++) {
        table.deleteRow(1);
    }
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






