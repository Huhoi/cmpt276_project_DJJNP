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


  const maxEventsToShow = 2;
  const remainingEventsCount = todayEventList.length - maxEventsToShow;
  //Adds events to list to display at most 5 events
  todayEventList.slice(0, maxEventsToShow).forEach(event => {
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
    
  });
    
  // Add the ellipsis row if there are more events
  if (remainingEventsCount > 0) {

  // Add the row to show the count of remaining events
  const remainingEventsRow = tableBody.insertRow();
  const remainingEventsCell = remainingEventsRow.insertCell();
  remainingEventsCell.colSpan = 4; // Span the cell across all columns
  remainingEventsCell.textContent = `. . . ${remainingEventsCount} More Events . . .`; // Display the count of remaining events
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