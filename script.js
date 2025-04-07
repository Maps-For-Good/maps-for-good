let map = L.map('map').setView([42.271389, -71.798889], 9);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
    alert("Geolocation is not supported.");
    }
  }
  
function success(position) {
    map.panTo([position.coords.latitude, position.coords.longitude]);
  }
  
  function error() {
    alert("Sorry, no position available.");
  }

L.marker([51.5, -0.09]).addTo(map)
    .bindPopup('A pretty CSS popup!<br> Easily customizable!')
    .openPopup();

    getLocation();
 function onMapClick(e) {
    let say = prompt('What does it say?')

    L.marker(e.latlng).addTo(map)
    .bindPopup(say)
    .openPopup();
    }
    
    map.on('click', onMapClick);

function toggleAbout() {
    var x = document.getElementById("abt");
    if (x.style.display === "none") {
        x.style.display = "block";
      } else {
        x.style.display = "none";
      }
}

function toggleContact() {
    var x = document.getElementById("cont");
    if (x.style.display === "none") {
        x.style.display = "block";
      } else {
        x.style.display = "none";
      }
}

function toggleBox(contentId) {
  const popupBox = document.getElementById('popup-box');
  const allContent = document.querySelectorAll('.popup-content');
  const selectedContent = document.getElementById(contentId);

  const isActive = selectedContent.classList.contains('active');

  allContent.forEach(content => content.classList.remove('active'));

  if (isActive) {
    popupBox.classList.add('hidden');
  } else {
    selectedContent.classList.add('active');
    popupBox.classList.remove('hidden');
  }
}

