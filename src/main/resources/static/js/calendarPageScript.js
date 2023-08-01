let nav = 0;
let clicked = null;
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];
let weatherData = null;
let weatherDataIndex = 0;
let todayEventList = [];


const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const deleteEventModal = document.getElementById('deleteEventModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitleInput = document.getElementById('eventTitleInput');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


function initAutocomplete() {
  const input = document.getElementById('searchBox');
  const autocomplete = new google.maps.places.Autocomplete(input, {
    fields: ['name', 'formatted_address', 'geometry.location'],
  });
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    document.getElementById("locationLat").value = place.geometry.location.lat();
    document.getElementById("locationLng").value = place.geometry.location.lng();
  });
}

let weatherMapping = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Drizzle: Light",
  53: "Drizzle: Moderate",
  55: "Drizzle: Dense intensity",
  56: "Freezing Drizzle: Light",
  57: "Freezing Drizzle: Dense intensity",
  61: "Rain: Slight",
  63: "Rain: Moderate",
  65: "Rain: Heavy intensity",
  66: "Freezing Rain: Light",
  67: "Freezing Rain: Heavy intensity",
  71: "Snow fall: Slight",
  73: "Snow fall: Moderate",
  75: "Snow fall: Heavy intensity",
  77: "Snow grains",
  80: "Rain showers: Slight",
  81: "Rain showers: Moderate",
  82: "Rain showers: Violent",
  85: "Snow showers: Slight",
  86: "Snow showers: Heavy",
  95: "Thunderstorm: Slight or moderate",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail"
};

let weatherIconMapping = {
  0: "wi-day-sunny",
  1: "wi-day-cloudy",
  2: "wi-day-cloudy",
  3: "wi-cloudy",
  45: "wi-fog",
  48: "wi-fog",
  51: "wi-sprinkle",
  53: "wi-showers",
  55: "wi-rain",
  56: "wi-rain-mix",
  57: "wi-rain-mix",
  61: "wi-sprinkle",
  63: "wi-showers",
  65: "wi-rain",
  66: "wi-rain-mix",
  67: "wi-rain-mix",
  71: "wi-snow",
  73: "wi-snow",
  75: "wi-snow",
  77: "wi-snow",
  80: "wi-showers",
  81: "wi-showers",
  82: "wi-rain",
  85: "wi-snow",
  86: "wi-snow",
  95: "wi-thunderstorm",
  96: "wi-thunderstorm",
  99: "wi-thunderstorm"
};
let weatherColorMapping = {
  0: "#FDB813", //sunny
  1: "#A4A4A4", //mainly clear
  2: "#A4A4A4", //partly cloudy
  3: "#6E6E6E", //overcast
  45: "#6E6E6E", //fog
  48: "#6E6E6E", //depositing rime fog
  51: "#0095ff", //drizzle: Light
  53: "#0095ff", //drizzle: Moderate
  55: "#0095ff", //drizzle: Dense intensity
  56: "#0095ff", //freezing drizzle: Light
  57: "#0095ff", //freezing drizzle: Dense intensity
  61: "#0095ff", //rain: Slight
  63: "#0095ff", //rain: Moderate
  65: "#0095ff", //rain: Heavy intensity
  66: "#0095ff", //freezing rain: Light
  67: "#0095ff", //freezing rain: Heavy intensity
  71: "#c6fffa", //snow fall: Slight
  73: "#c6fffa", //snow fall: Moderate
  75: "#c6fffa", //snow fall: Heavy intensity
  77: "#c6fffa", //snow grains
  80: "#0095ff", //rain showers: Slight
  81: "#0095ff", //rain showers: Moderate
  82: "#0095ff", //rain showers: Violent
  85: "#0095ff", //snow showers: Slight
  86: "#2E9AFE", //snow showers: Heavy
  95: "#DF0101", //thunderstorm: Slight or moderate
  96: "#DF0101", //thunderstorm with slight hail
  99: "#DF0101" //thunderstorm with heavy hail
};



function decodeWeatherCode(code) {
  return weatherMapping[code] || "Unknown";
}

//Fetches Weather API
async function fetchWeatherData() {
  try {
    const result = await fetch("https://api.open-meteo.com/v1/forecast?latitude=49.24&longitude=-122.98&daily=weathercode&timezone=America%2FLos_Angeles&models=gem_seamless");
    return await result.json();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

//Opens the Modal (Popup)
function openModal(date) {
  document.getElementById("searchBox").value = null;
  
  //The day that is clicked
  clicked = date;

  //Changes an hidden input to selected date on click
  document.getElementById('selectedDate').value = date;

  //Selecteddate
  let selectedDate = document.getElementById('selectedDate').value;


  //Creates the ADD Event Modal
  newEventModal.style.display = 'block';

  //Creates a "Backdrop" when model opens
  backDrop.style.display = 'block';

  //Gets current uid
  let currentUser = document.getElementById("currentUser").value;

  //Use fetch to get data from EVENT table from database
  fetch('/api/event')
    .then(response => response.json())
    .then(data => {

    const currentDate = new Date(); // Get the current date
      for (const i of data) {
        if (i.uid == currentUser) {
          const eventDate = new Date(i.date);
          // Extract the components from the eventDate
          const month = eventDate.getMonth() + 1; // JavaScript months are zero-based, so we add 1
          const day = eventDate.getDate();
          const year = eventDate.getFullYear();

          // Create the formatted date string in the "M/d/yyyy" format
          const formattedDate = `${month}/${day}/${year}`;

          console.log(formattedDate); // Output: "7/25/2023" (assuming the eventDate is July 25, 2023)
        
          //Pushes current day events to 
          if (formattedDate === selectedDate) {
            console.log(eventDate);
            console.log(currentDate);

            todayEventList.push({
              eventName: i.eventName,
              date: new Date(i.date),
              timeBegin: i.timeBegin,
              timeEnd: i.timeEnd, 
              uid: i.uid,
              sid: i.sid
            });
          }
        }
      }
      
    // Sort the todayEventList by timeBegin in ascending order
    todayEventList.sort((a, b) => {
      if (a.timeBegin !== b.timeBegin) {
        // Sort by timeBegin first
        return a.timeBegin - b.timeBegin;
      } else {
        // If timeBegin values are equal, sort by timeEnd
        return a.timeEnd - b.timeEnd;
      }
    });
      
    loadEventsToList();

    // Now eventList contains events sorted by their date/time
    console.log(todayEventList);
      
  }).catch(error => console.error('Error fetching events', error));
}

//Loads the events onto a html table
function loadEventsToList() {
  // Get a reference to the table body element
  const tableBody = document.querySelector('#tEvents tbody');
      
  // Clear any existing rows in the table
  tableBody.innerHTML = '';
  
  //Adds events to list
  todayEventList.forEach(event => {
    const row = tableBody.insertRow();
  
    // Add cells with event data to the row
    const eventNameCell = row.insertCell();
    eventNameCell.textContent = event.eventName;
    
    //Time Begin
    const timeBeginCell = row.insertCell();
    timeBeginCell.textContent = convertTo12HourFormat(event.timeBegin); // Display the date in a human-readable format
    
    //Tiem ENd
    const timeEndCell = row.insertCell();
    timeEndCell.textContent = convertTo12HourFormat(event.timeEnd);
  
    //Date
    const dateCell = row.insertCell();
    dateCell.textContent = event.date.toLocaleDateString('en-US'); // Display date in "Month/day/year" format
    
    //Delete Button
    const deleteCell = row.insertCell();
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('id', 'deleteButton');
    deleteButton.addEventListener('click', () => handleDeleteEvent(event.sid));
    deleteCell.appendChild(deleteButton);
    
  });
}

//Reloads the Modal ie Reloads the data on the opened modal
function reloadModal() {
  document.getElementById("searchBox").value = null;
  loadEventsToList();
}

//Closes Modal
function closeModal() {
  eventTitleInput.classList.remove('error');
  newEventModal.style.display = 'none';
  deleteEventModal.style.display = 'none';
  backDrop.style.display = 'none';
  clicked = null;
  load();
  allEventList = [];
  todayEventList = [];
  check = 0;
}

//Saves Events Added
async function saveEvent(event) {
  event.preventDefault();
  if (eventTitleInput.value) {
    eventTitleInput.classList.remove('error');
    
    //Asserts data into a EventData Object to be sent to the backend
    const eventData = {
      eventName: eventTitleInput.value,
      date: clicked,
      timeBegin: parseInt(document.getElementById('timeBegin').value),
      timeEnd: parseInt(document.getElementById('timeEnd').value),
      uid: parseInt(document.getElementById('currentUser').value),
      longitude: document.getElementById('locationLng').value,
      latitude: document.getElementById('locationLat').value,
    };

    try {
      const response = await fetch('/api/calendar/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData), 
      });

      if (response.ok) {
        // If the event is successfully saved, update the table in the modal
        todayEventList.push({
          eventName: eventData.eventName,
          date: new Date(eventData.date),
          timeBegin: eventData.timeBegin,
          timeEnd: eventData.timeEnd,
          uid: eventData.uid,
          sid: eventData.sid,
        });

        // Sort the todayEventList by timeBegin in ascending order
        todayEventList.sort((a, b) => {
          if (a.timeBegin !== b.timeBegin) {
            // Sort by timeBegin first
            return a.timeBegin - b.timeBegin;
          } else {
            // If timeBegin values are equal, sort by timeEnd
            return a.timeEnd - b.timeEnd;
          }
        });

        // Update the table in the modal without closing it
        reloadModal();

        //Reset the input fields after saving
        eventTitleInput.value = '';
        document.getElementById('timeBegin').selectedIndex = 0;
        document.getElementById('timeEnd').selectedIndex = 0;

      } else {
        console.error('Failed to save event:', response.status);
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  } else {
    eventTitleInput.classList.add('error');
  }
}


//Deletes Events
function handleDeleteEvent(sid) {
  //Fetches backend controller to delete
  fetch(`/api/${sid}`, {
    method: 'DELETE'
  })
    .then(response => {

    // Event deleted successfully
    if (response.ok) {
      todayEventList = todayEventList.filter(event => event.sid !== sid);
      // Refresh the table after deletion
      load();
      reloadModal();
      //Failed to delete the event
    }
    else {
      console.error('Error deleting event');
    }
  })
    
  .catch(error => console.error('Error deleting event', error));
}

// Function to convert time from military (24-hour) to 12-hour format
function convertTo12HourFormat(militaryTime) {
  const hours = Math.floor(militaryTime / 100);
  const minutes = militaryTime % 100;
  const ampm = hours >= 12 ? 'pm' : 'am';

  let formattedHours = hours % 12;
  formattedHours = formattedHours === 0 ? 12 : formattedHours;

  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}


//Initalize date for loading calendar
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// //Loads the Calendar
async function load() {
  const dt = new Date(currentYear, currentMonth, 1);

  // Get the Current Date
  const today = new Date();
  const year = dt.getFullYear();
  const firstDayOfMonth = new Date(year, currentMonth, 1);
  const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
  const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  //Adds Blank Boxes Representing the Previous Month
  const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

  //Prepares the Month Display
  document.getElementById('monthDisplay').innerText = `${dt.toLocaleDateString('en-us', { month: 'long' })} ${currentYear}`;

  //Empties Month Display before Insertion
  calendar.innerHTML = '';

  //Fetch the weather data
  const fetchedData = await fetchWeatherData();
  if (fetchedData && fetchedData.daily && fetchedData.daily.weathercode) {
    weatherData = fetchedData.daily.weathercode;
  } else {
    weatherData = null;
  }
  weatherDataIndex = 0;

  for (let i = 1; i <= paddingDays + daysInMonth; i++) {
    const daySquare = document.createElement('div');
    daySquare.classList.add('day');
    const dayString = `${currentMonth + 1}/${i - paddingDays}/${year}`;

    if (i > paddingDays) {
      daySquare.innerText = i - paddingDays;

      //Highlight the box representing today
      if (currentMonth === today.getMonth() && currentYear === today.getFullYear() && i - paddingDays === today.getDate()) {
        daySquare.id = 'currentDay';
      }

      const isForecastAvailable = weatherData && weatherDataIndex < weatherData.length;
      if ((currentMonth === today.getMonth() && i - paddingDays >= today.getDate() && isForecastAvailable) || (nav > 0 && isForecastAvailable)) {
        const weatherForDay = weatherData[weatherDataIndex];
        if (weatherForDay !== null) {
          const weatherDiv = document.createElement('div');
          weatherDiv.classList.add('weather');

          const weatherIcon = document.createElement('i');
          weatherIcon.className = `wi ${weatherIconMapping[weatherForDay]} weather-icon`;

          // Set the color of the icon according to the mapping
          weatherIcon.style.color = weatherColorMapping[weatherForDay];

          weatherIcon.title = decodeWeatherCode(weatherForDay);

          weatherDiv.appendChild(weatherIcon);
          daySquare.appendChild(weatherDiv);
        }
        weatherDataIndex++;
      }

      daySquare.addEventListener('click', () => openModal(dayString));
    }
    else {
      daySquare.classList.add('padding');
    }

    calendar.appendChild(daySquare);
  }
}



// Function to export data to Excel
async function exportToExcel() {
  const currentUser = parseInt(document.getElementById("currentUser").value);
  const currentUserEmail = document.getElementById("currentUserEmail").value;
  try {
    const response = await fetch(`/api/event/${currentUser}`);
    if (!response.ok) {
      throw new Error('Failed to fetch events data');
    }
    const eventData = await response.json();

    const data = eventData.map(event => ({
      'Event Name': event.eventName,
      'Date': new Date(event.date).toLocaleDateString('en-US'),
      'Time Begin': convertTo12HourFormat(event.timeBegin),
      'Time End': convertTo12HourFormat(event.timeEnd),
      'Longitude': event.longitude,
      'Latitude': event.latitude
    }));

    const today = new Date().toLocaleDateString('en-us', { year: 'numeric', month: 'numeric', day: 'numeric' });
    const filename = `${currentUserEmail}_event_data.xlsx`;

    // Create a new Excel workbook
    const workbook = XLSX.utils.book_new();

    // Convert the data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Events');

    // Export the workbook to an Excel file
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error exporting data to Excel:', error);
    alert('Failed to export data to Excel. Please try again.');
  }
}

//Event listener to the Export button
document.getElementById('exportButton').addEventListener('click', exportToExcel);




//Initalizes buttons
function initButtons() {
  document.getElementById('nextButton').addEventListener('click', () => {
    // Increment currentMonth and update the calendar
    currentMonth++;
    if (currentMonth > 11) {
      // If currentMonth exceeds December, switch to the next year
      currentMonth = 0;
      currentYear++;
    }
    load();
  });

  document.getElementById('backButton').addEventListener('click', () => {
    // Decrement currentMonth and update the calendar
    currentMonth--;
    if (currentMonth < 0) {
      // If currentMonth goes below January, switch to the previous year
      currentMonth = 11;
      currentYear--;
    }
    load();
  });

  document.getElementById('saveButton').addEventListener('click', saveEvent);
  document.getElementById('cancelButton').addEventListener('click', closeModal);
  document.getElementById('deleteButton').addEventListener('click', deleteEvent);
  document.getElementById('closeButton').addEventListener('click', closeModal);
}



function deleteEvent() {
  events = events.filter(e => e.date !== clicked);
  localStorage.setItem('events', JSON.stringify(events));
  closeModal();
}


//Checks if there are conflicting time begins
function timeCheck() {
  var timeBeginValue = parseInt(document.getElementById('timeBegin').value);
  var timeEndValue = parseInt(document.getElementById('timeEnd').value);

  var timeBegin = document.getElementById('timeBegin');
  var timeEnd = document.getElementById('timeEnd');

  if (timeBeginValue > timeEndValue) {
    window.alert("Time Error");
    timeBegin.selectedIndex = 0;
    timeEnd.selectedIndex = 0;
  }
}

initButtons();
load();

// Share Button Stuff
function copyToClipboard(){
  const shareLinkInput = document.getElementById("shareLink");
  shareLinkInput.select();
  shareLinkInput.setSelectionRange(0, 99999); // For mobile devices
  // Copy the text inside the text field
  navigator.clipboard.writeText(shareLinkInput.value);
  // Alert the copied text
  alert("Copied the text: " + shareLinkInput.value);
}