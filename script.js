let map = L.map('map').setView([42.3, -71.1], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function haversine(lat1, long1, lat2, long2) {
  function hav(theta) {
    return (1 - Math.cos(theta * Math.PI / 180)) / 2;
  }
  let dlat = lat2 - lat1;
  let dlong = long2 - long1;
  let latm = (lat1 + lat2) / 2;

  return 2 * 3963.1906 * Math.asin(Math.sqrt(
    hav(dlat) + (1 - hav(dlat) - hav(2 * latm)) * hav(dlong)
  ));
}

L.marker([51.5, -0.09]).addTo(map)
    .bindPopup('A pretty CSS popup!<br> Easily customizable!');
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
    
getLocation();

    function render(fields) {
        const latitude = fields.latitude;
        const longitude = fields.longitude;
        let stuff = encodeURIComponent(`${latitude}, ${longitude} ${fields.name}`);
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${stuff}`;
        
        return `
            <h3>${fields.name}</h3>
            <a href="${googleMapsUrl}" target="_blank">
                Open in Google Maps
            </a>
        `;
    }
    fetch('bathrooms.json').then((r) => r.json()).then(async markers => {
      let markerGroup = L.featureGroup([]).addTo(map);
        
      for (const key in markers) {
          let latlng = L.latLng(markers[key].latitude, markers[key].longitude);
          L.marker(latlng).bindPopup(render(markers[key])).addTo(markerGroup);
      }
      setInterval(() => {
      let sorted = Object.keys(markers).sort((a, b) => {
        let da = haversine(markers[a].latitude, markers[a].longitude, map._lastCenter.lat, map._lastCenter.lng);
        let db = haversine(markers[b].latitude, markers[b].longitude, map._lastCenter.lat, map._lastCenter.lng);
        return da - db;
      });
      const grid = document.querySelector('.footer-scroll-grid');
      while (grid.firstChild) {
        grid.removeChild(grid.lastChild);
      }
      for (const key of sorted) {
        const entry = document.createElement('div');
        const title = document.createElement('h4');
        const desc = document.createElement('p');
        title.textContent = markers[key].name;

        let dist = haversine(markers[key].latitude, markers[key].longitude, map._lastCenter.lat, map._lastCenter.lng);
        let str = document.createElement('strong');
        str.textContent = `${dist.toFixed(1)} miles away. `;
        desc.textContent = `${markers[key].address}, ${markers[key].zip}.`
        desc.prepend(str);
        entry.className = 'footer-item';
        entry.appendChild(title); entry.appendChild(desc);
        grid.appendChild(entry);
      }
    }, 1000);
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


