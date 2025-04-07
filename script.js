

let map = L.map('map').setView([42.3, -71.1], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.marker([51.5, -0.09]).addTo(map)
    .bindPopup('A pretty CSS popup!<br> Easily customizable!');

    getLocation();

    function render(fields) {
        return `<h3>${fields.name}</h3>`;
    }
    fetch('bathrooms.json').then((r) => r.json()).then(markers => {
      let markerGroup = L.featureGroup([]).addTo(map);
        
      for (const key in markers) {
          let latlng = L.latLng(markers[key].latitude, markers[key].longitude);
          L.marker(latlng).bindPopup(render(markers[key])).addTo(markerGroup);
      }
    });
        
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

