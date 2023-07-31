let nav = 0;
let clicked = null;
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];
let weatherData = null;
let weatherDataIndex = 0;
let todayEventList = [];

let check = 0;

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
    
      const deleteCell = row.insertCell();
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => handleDeleteEvent(event.sid));
      deleteCell.appendChild(deleteButton);
      
    });
      
    // Now eventList contains events sorted by their date/time
    console.log(todayEventList);
      
  }).catch(error => console.error('Error fetching events', error));
}

//Reloads the Modal
function reloadModal() {
  // Here you can add any additional logic to fetch updated event data from the server
  // For now, let's just clear the existing table and re-populate it with updated data
  const tableBody = document.querySelector('#tEvents tbody');
  tableBody.innerHTML = ''; // Clear existing table rows

    
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
    
      const deleteCell = row.insertCell();
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => handleDeleteEvent(event.sid));
      deleteCell.appendChild(deleteButton);
      
    });
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
          sid: eventData.sid, // Replace this with the actual sid received from the server
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
  // You can implement the logic here to delete the event from the database using fetch or any other method.
  // For this example, let's assume you are sending a DELETE request to the backend.

  fetch(`/api/${sid}`, {
    method: 'DELETE'
  })
  .then(response => {
    if (response.ok) {
      // Event deleted successfully, you may also want to remove the event from the frontend list.
      todayEventList = todayEventList.filter(event => event.sid !== sid);
      // Refresh the table after deletion
      load();
      reloadModal();
    } else {
      // Failed to delete the event
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

// Function to export data to Excel
async function exportToExcel() {
  const currentUser = parseInt(document.getElementById("currentUser").value);
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
    const filename = `events_${today}.xlsx`;

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


//Loads the Calendar
async function load() {
  const dt = new Date();

  if (nav !== 0) {
    dt.setMonth(new Date().getMonth() + nav);
  }

  const today = new Date().getDate();
  const currentMonth = new Date().getMonth();
  const month = dt.getMonth();
  const year = dt.getFullYear();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

  document.getElementById('monthDisplay').innerText = `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

  calendar.innerHTML = '';

  if (month === currentMonth) {
    const fetchedData = await fetchWeatherData();
    if (fetchedData && fetchedData.daily && fetchedData.daily.weathercode) {
      weatherData = fetchedData.daily.weathercode;
      weatherDataIndex = 0;
    } else {
      weatherData = null;
    }
  }

  for (let i = 1; i <= paddingDays + daysInMonth; i++) {
    const daySquare = document.createElement('div');
    daySquare.classList.add('day');
    const dayString = `${month + 1}/${i - paddingDays}/${year}`;

    if (i > paddingDays) {
      daySquare.innerText = i - paddingDays;

      if (i - paddingDays === today && nav === 0) {
        daySquare.id = 'currentDay';
      }

      const isForecastAvailable = weatherData && weatherDataIndex < weatherData.length;
      if ((month === currentMonth && i - paddingDays >= today && isForecastAvailable) || (nav > 0 && isForecastAvailable)) {
        const weatherForDay = weatherData[weatherDataIndex];
        if (weatherForDay !== null) {
          const weatherDiv = document.createElement('div');
          weatherDiv.classList.add('weather');
          weatherDiv.innerText = decodeWeatherCode(weatherForDay);
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


//Initalizes buttons
function initButtons() {
  document.getElementById('nextButton').addEventListener('click', () => {
    nav++;
    load();
  });

  document.getElementById('backButton').addEventListener('click', () => {
    nav--;
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
