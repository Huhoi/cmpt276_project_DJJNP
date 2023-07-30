let todayEventList = [];
let currentUser = document.getElementById("currentUser").value;

const tableBody = document.querySelector('#tSchedule tbody');

//Gets todays date
const currentDate = new Date(); // Get the current date
const currMonth = currentDate.getMonth() + 1; // JavaScript months are zero-based, so we add 1
const currDay = currentDate.getDate();
const currYear = currentDate.getFullYear();

// Create the formatted date string in the "M/d/yyyy" format
const currFormattedDate = `${currMonth}/${currDay}/${currYear}`;


fetch('/api/event')
.then(response => response.json())
  .then(data => {
  
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
      console.log(currFormattedDate); // Output: "7/25/2023" (assuming the eventDate is July 25, 2023)
    
      //Pushes current day events to 
      if (formattedDate === currFormattedDate) {
        todayEventList.push({
          eventName: i.eventName,
          date: new Date(i.date),
          timeBegin: i.timeBegin, // Convert to 12-hour time format
          timeEnd: i.timeEnd, // Convert to 12-hour time format
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
  const tableBody = document.querySelector('#tSchedule tbody');
    
  // Clear any existing rows in the table
  tableBody.innerHTML = '';

// Adds events to the table, limiting the display to at most 5 events
const maxEventsToShow = 3;
const eventsToDisplay = todayEventList.slice(0, maxEventsToShow);
const remainingEventsCount = todayEventList.length - eventsToDisplay.length;

if (eventsToDisplay.length === 0) {
  // Display a message when there are no events for the current day
  const noEventsRow = tableBody.insertRow();
  const noEventsCell = noEventsRow.insertCell();
  noEventsCell.colSpan = 4; // Span the cell across all columns
  noEventsCell.textContent = 'No events for today';
} else {
  // Display events in the table
  eventsToDisplay.forEach(event => {
    const row = tableBody.insertRow();

    // Add cells with event data to the row
    const eventNameCell = row.insertCell();
    eventNameCell.textContent = event.eventName;

    // Time Begin
    const timeBeginCell = row.insertCell();
    timeBeginCell.textContent = convertTo12HourFormat(event.timeBegin);

    // Time End
    const timeEndCell = row.insertCell();
    timeEndCell.textContent = convertTo12HourFormat(event.timeEnd);

    // Date
    const dateCell = row.insertCell();
    dateCell.textContent = event.date.toLocaleDateString('en-US'); // Display date in "Month/day/year" format
  });

  if (remainingEventsCount > 0) {
    // Add the ellipsis row with the remaining events count
    const ellipsisRow = tableBody.insertRow();
    const ellipsisCell = ellipsisRow.insertCell();
    ellipsisCell.colSpan = 4; // Span the cell across all columns
    ellipsisCell.textContent = `... and ${remainingEventsCount} more event(s)`;
  }
}


  // Now eventList contains events sorted by their date/time
  console.log(todayEventList);
    
  }).catch(error => console.error('Error fetching events', error));

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

document.addEventListener('DOMContentLoaded', function() {
  const h1Element = document.getElementById('ScheduleTitle');
  const currentDate = new Date();

  // Get the month name
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[currentDate.getMonth()];

  // Get the day and year
  const day = currentDate.getDate();
  const year = currentDate.getFullYear();

  // Create the formatted date string in the "month day, year" format
  const formattedDate = `${monthName} ${day}, ${year}`;

  // Append the formatted date to the h1 element
  h1Element.textContent += ' ' + formattedDate;
});

// ===================
// Initialize map view
function initMap() {
  console.log("initMap() running");
  // Edit map options and assign it to its HTML ID
  var options = {
      disableDefaultUI: true,
      clickableIcons: false,
      gestureHandling: "none",
      zoomControl: false,
      center: {lat: 49.278059, lng: -122.919883},
      zoom: 10
  };
  map = new google.maps.Map(document.getElementById("previewMap"), options);
}