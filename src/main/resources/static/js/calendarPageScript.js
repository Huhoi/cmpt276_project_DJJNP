let nav = 0;
let clicked = null;
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];
let weatherData = null;
let weatherDataIndex = 0;

const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const deleteEventModal = document.getElementById('deleteEventModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitleInput = document.getElementById('eventTitleInput');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// let weatherMapping = {
//   0: "Clear sky",
//   1: "Mainly clear",
//   2: "Partly cloudy",
//   3: "Overcast",
//   45: "Fog",
//   48: "Depositing rime fog",
//   51: "Drizzle: Light",
//   53: "Drizzle: Moderate",
//   55: "Drizzle: Dense intensity",
//   56: "Freezing Drizzle: Light",
//   57: "Freezing Drizzle: Dense intensity",
//   61: "Rain: Slight",
//   63: "Rain: Moderate",
//   65: "Rain: Heavy intensity",
//   66: "Freezing Rain: Light",
//   67: "Freezing Rain: Heavy intensity",
//   71: "Snow fall: Slight",
//   73: "Snow fall: Moderate",
//   75: "Snow fall: Heavy intensity",
//   77: "Snow grains",
//   80: "Rain showers: Slight",
//   81: "Rain showers: Moderate",
//   82: "Rain showers: Violent",
//   85: "Snow showers: Slight",
//   86: "Snow showers: Heavy",
//   95: "Thunderstorm: Slight or moderate",
//   96: "Thunderstorm with slight hail",
//   99: "Thunderstorm with heavy hail"
// };

// function decodeWeatherCode(code) {
//   return weatherMapping[code] || "Unknown";
// }



// async function fetchWeatherData() {
//   try {
//     const result = await fetch("https://api.open-meteo.com/v1/forecast?latitude=49.24&longitude=-122.98&daily=weathercode&timezone=America%2FLos_Angeles&forecast_days=16&models=gem_seamless");
//     return await result.json();
//   } catch (error) {
//     console.error("Error fetching weather data:", error);
//     return null;
//   }
// }



function openModal(date) {
  //The day that is clicked
  clicked = date;

  //Changes an hidden input to selected date on click
  document.getElementById('selectedDate').value = date;
  document.getElementById('selectedDate2').value = date;

  //Creates the ADD Event Modal
  newEventModal.style.display = 'block';

  //Creates a "Backdrop" when model opens
  backDrop.style.display = 'block';

  //Grabs the array of events
  //const eventForDay = events.find(e => e.date === clicked);
  // if (eventForDay) {
  //   document.getElementById('eventText').innerText = eventForDay.title;
  //   deleteEventModal.style.display = 'block';
  // } else {
  //    newEventModal.style.display = 'block';
  // }
  
}

//Loads in the Calendar
function load() {
  const dt = new Date();
  if (nav !== 0) {
    dt.setMonth(new Date().getMonth() + nav);
  }

  //Gets the current date
  const day = dt.getDate();
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

  document.getElementById('monthDisplay').innerText =
      `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

  calendar.innerHTML = '';

  for (let i = 1; i <= paddingDays + daysInMonth; i++) {
    //Creates the a box for each day of the month
    const daySquare = document.createElement('div');
    daySquare.classList.add('day');
    const dayString = `${month + 1}/${i - paddingDays}/${year}`;

    //Highlights the current date
    if (i > paddingDays) {
      daySquare.innerText = i - paddingDays;

      if (i - paddingDays === day && nav === 0) {
        daySquare.id = 'currentDay';
      }

      //Listens for click on day of month
      daySquare.addEventListener('click', () => openModal(dayString));

    }
    else {
      daySquare.classList.add('padding');
    }

    calendar.appendChild(daySquare);
  }
}

// Closes the modal
function closeModal() {
  eventTitleInput.classList.remove('error');
  newEventModal.style.display = 'none';
  deleteEventModal.style.display = 'none';
  backDrop.style.display = 'none';
  clicked = null;
  load();
}


function saveEvent() {
  if (eventTitleInput.value) {
    eventTitleInput.classList.remove('error');

    events.push({
      date: clicked,
      title: eventTitleInput.value,
    });

    closeModal();
  } else {
    eventTitleInput.classList.add('error');
  }
}

function deleteEvent() {
  events = events.filter(e => e.date !== clicked);
  localStorage.setItem('events', JSON.stringify(events));
  closeModal();
}


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
