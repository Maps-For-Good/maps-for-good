

let map = L.map('map').setView([42.3, -71.1], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


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
    let say = prompt('what does it say?')

    L.marker(e.latlng).addTo(map)
    .bindPopup(say)
    .openPopup();
    }
    
    map.on('click', onMapClick);
