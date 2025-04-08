

let map = L.map('map').setView([42.3, -71.1], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

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

  var fs=require('fs');
var data=fs.readFileSync('words.json', 'utf8');
var words=JSON.parse(data);
var bodyparser=require('body-parser');
console.log(words);
var express=require('express');

var app=express();

var server=app.listen(3030,listening);
}

