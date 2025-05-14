//import data 
import bathrooms_ from './data/bathrooms/bathrooms.js';;
import parking from './data/handicap-parking/handicap-parking.js';
import MurmurHash3 from 'https://cdn.skypack.dev/imurmurhash';
import {getLikesById, incrementLikes, incrementDislikes, decrementLikes, decrementDislikes, uploadFeature, addAdditionalInfo } from './firebase.js';
let map = L.map('map').setView([42.3, -71.1], 13);

//initialize leaflet map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

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
// this is a dumb solution, should do it in a better way
window.toggleBox = toggleBox;

//haversine formula to calculate distances between coords
function haversine(lat1, long1, lat2, long2) {
    // https://en.wikipedia.org/wiki/Haversine_formula
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
//centers map to user location
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
   // alert("Sorry, no position available.");
}

getLocation();

//make gmap link 
function getMapsLink(location) {
    let query = encodeURIComponent(`${location.latitude}, ${location.longitude} ${location.fields.name ?? ""}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

let hasLiked = {};
let hasDisliked = {};

//likes/dislikes on popup 
function addELs(marker, id) {
    if (hasLiked[id]) {
        const likeBox = marker.getPopup().getElement().querySelector('.like-checkbox');
        likeBox.checked = true;
        likeBox.nextElementSibling.nextElementSibling.textContent = Number(likeBox.nextElementSibling.nextElementSibling.textContent) + 1;
    }
    if (hasDisliked[id]) {
        const dislikeBox = marker.getPopup().getElement().querySelector('.dislike-checkbox');
        dislikeBox.checked = true;
        dislikeBox.nextElementSibling.nextElementSibling.textContent = Number(dislikeBox.nextElementSibling.nextElementSibling.textContent) + 1;
    }
    marker.getPopup().getElement().querySelector('.like-checkbox').addEventListener('change', (e) => {
        if (e.target.checked) {
            e.target.nextElementSibling.nextElementSibling.textContent = Number(e.target.nextElementSibling.nextElementSibling.textContent) + 1;
            incrementLikes(id);
            hasLiked[id] = true;
        } else {
            e.target.nextElementSibling.nextElementSibling.textContent = Number(e.target.nextElementSibling.nextElementSibling.textContent) - 1;
            decrementLikes(id);
            hasLiked[id] = false;
        }
    });

    marker.getPopup().getElement().querySelector('.dislike-checkbox').addEventListener('change', (e) => {
        if (e.target.checked) {
            e.target.nextElementSibling.nextElementSibling.textContent = Number(e.target.nextElementSibling.nextElementSibling.textContent) + 1;
            incrementDislikes(id);
            hasDisliked[id] = true;
        } else {
            e.target.nextElementSibling.nextElementSibling.textContent = Number(e.target.nextElementSibling.nextElementSibling.textContent) - 1;
            decrementDislikes(id);
            hasDisliked[id] = false;
        }
    });

}

//ui like/dislike
function addReactionBox(am, marker) {
    const id = getId(am);
    async function addReactions(id, marker) {
        if (marker.hasReactions) {
            addELs(marker, id);
            return;
        }
        marker.hasReactions = true;
        const res = await getLikesById(id);
        const likes = res.num_likes;
        const dislikes = res.num_dislikes;
        let reactions = `<div class="reaction-container">
               <div class="reaction">
               <input type="checkbox" class="reaction-checkbox like-checkbox" id="like-checkbox-${id}"/>
                <label for="like-checkbox-${id}">
                    <img src="icons/Like.png" alt="Like" class="reaction-icon" />
                </label>
               <span>${likes ?? 0}</span>
               </div>
               <div class="reaction">
               <input type="checkbox" class="reaction-checkbox dislike-checkbox" id="dislike-checkbox-${id}"/>
                <label for="dislike-checkbox-${id}">
                    <img src="icons/Dislike.png" alt="Dislike" class="reaction-icon" />
                </label>
                <span>${dislikes ?? 0}</span>
               </div>
              </div>`;
        const updatedContent = marker.getPopup().getContent() + reactions;
        marker.getPopup().setContent(updatedContent);
        addELs(marker, id);

      }
    marker.on('popupopen', function() {
        addReactions(id, marker);  
    });

}

//render amenity content 
function renderBathroom(br, marker) {
    addReactionBox(br, marker);
    const googleMapsUrl = getMapsLink(br);
    if (br.fields.osm) {
        return `
            <h3>Bathroom</h3>
            <a href="${googleMapsUrl}" target="_blank">
                Open in Google Maps
            </a>
            <div>
                <strong>Wheelchair:</strong> ${br.fields.wheelchair ?? 'unknown'}
            </div>
            <div>
                <strong>Unisex:</strong> ${br.fields.unisex ?? 'unknown'}
            </div>
        `;
    } else {
    return `
            <h3>${br.fields.name}</h3>
            <a href="${googleMapsUrl}" target="_blank">
                Open in Google Maps
            </a>
            <div>
                <strong>Hours:</strong> ${br.fields.hours}
            </div>
        `;
    }
    
}

//create cluster groups 
function clusterIcon(type) {
    return (cluster) => new L.DivIcon({
        html: '<div><span>' + cluster.getChildCount() + ' <span aria-label="markers"></span>' + '</span></div>',
        className: `marker-cluster marker-cluster-${type}`,
        iconSize: new L.Point(40, 40)
    });
}
const bathroomCg = L.markerClusterGroup({
    iconCreateFunction: clusterIcon('bathroom'),

});
const benchCg = L.markerClusterGroup({
    iconCreateFunction: clusterIcon('bench'),
});
const parkingCg = L.markerClusterGroup({
    iconCreateFunction: clusterIcon('parking'),
});

//sets custom icon to each amenity 
let benchIcon = L.icon({
    iconUrl: 'icons/BenchPin.png',

    iconSize: [110, 90],
    iconAnchor: [55, 45],
    popupAnchor: [0, 0]
});

let bathroomIcon = L.icon({
    iconUrl: 'icons/BathroomPin.png',

    iconSize: [110, 90], // size of the icon
    iconAnchor: [55, 45],
    popupAnchor: [0, 0]
});

let parkingIcon = L.icon({
    iconUrl: 'icons/ParkingPin.png',

    iconSize: [110, 90],
    iconAnchor: [55, 45],
    popupAnchor: [0, 0]
});

function getId(amenity) {
    return (new MurmurHash3(JSON.stringify(amenity))).result();
}

function renderBench(bench, marker) {
    addReactionBox(bench, marker);
    const id = getId(bench);
    const googleMapsUrl = getMapsLink(bench);

    return `<strong>Bench</strong>
    <br>
    <a href="${googleMapsUrl}" target="_blank">
                Open in Google Maps
            </a>
    <div>
        <strong>Backrest:</strong> ${bench.fields.backrest ?? "Maybe"}
    </div>
    `;

}

function renderParking(parking, marker) {
    addReactionBox(parking, marker);
    const id = getId(parking);
    const googleMapsUrl = getMapsLink(parking);
     
    if (parking.fields.name) {
        let html = `<strong>${parking.fields.name}</strong>
        <br>
        <a href="${googleMapsUrl}" target="_blank">
                    Open in Google Maps
                </a>
        <div>
            ${parking.fields.address}
        </div>
        `;
        if (parking.fields.ap_sp != 'N/A') {
            html += `<div><strong>Number of spaces:</strong> ${parking.fields.ap_sp}</div>`;
        }
        return html;
    } else {
    return `Handicap Parking Spot
    <br>
    <a href="${googleMapsUrl}" target="_blank">
                Open in Google Maps
            </a>
    <div>
        ${parking.fields.address}
    </div>
    `;
    }
}
let bounds = map.getBounds();
let bbox = [41.51507, -73.50825, 42.89785, -69.92896];
const bathrooms = bathrooms_.concat(await getBathrooms(bbox));
let markers = [];
for (const b of bathrooms) {
    let latlng = L.latLng(b.latitude, b.longitude);
    let marker = L.marker(latlng, { icon: bathroomIcon });
    doubleClick(marker, getId(b));
    markers.push(marker.bindPopup(renderBathroom(b, marker)));
}
bathroomCg.addLayers(markers);


//sorts nearby amenities and updates ui every second
setInterval(() => {
    // The sorting is faster on subsequent runs bc the array is already nearly sorted
    let sorted = bathrooms.sort((a, b) => {
        let da = haversine(a.latitude, a.longitude, map.getCenter().lat, map.getCenter().lng);
        let db = haversine(b.latitude, b.longitude, map.getCenter().lat, map.getCenter().lng);
        return da - db;
    });

    const grid = document.querySelector('.footer-scroll-grid');
    while (grid.firstChild) {
        grid.removeChild(grid.lastChild);
    }
    for (let i = 0; i < sorted.length; i++) {
        const entry = document.createElement('a');
        entry.href = getMapsLink(sorted[i]);
        entry.setAttribute('target', '_blank');
        const title = document.createElement('h4');
        const desc = document.createElement('p');
        title.textContent = sorted[i].fields.name ?? 'Bathroom';

        let dist = haversine(sorted[i].latitude, sorted[i].longitude, map.getCenter().lat, map.getCenter().lng);
        let str = document.createElement('strong');
        str.textContent = `${dist.toFixed(1)} miles away. `;
        if (sorted[i].fields.address != undefined) {
            desc.textContent = `${sorted[i].fields.address}, ${sorted[i].fields.zip}.`;
        }

        desc.prepend(str);
        entry.className = 'footer-item';
        entry.appendChild(title); entry.appendChild(desc);
        grid.appendChild(entry);
    }
}, 1000);

//prompts user to create new pin (disabled)
function onMapClick(e) {
    return;
    let say = prompt('What do you want to add?')

    L.marker(e.latlng).addTo(map)
        .bindPopup(say)
        .openPopup();
}
map.on('click', onMapClick);

//puts amenities on map
const benches = await getBenches(bbox);
markers = [];
for (let i = 0; i < parking.length; i++) {
    const p = parking[i];
    let latlng = L.latLng(p.latitude, p.longitude);
    const marker = L.marker(latlng, { icon: parkingIcon });
    doubleClick(marker, getId(p));
    markers.push(marker.bindPopup(renderParking(p, marker)));
}
parkingCg.addLayers(markers);
//add markers 
markers = [];
for (let i = 0; i < benches.length; i++) {
    const b = benches[i];
    const latlng = L.latLng(b.latitude, b.longitude);
    const marker = L.marker(latlng, { icon: benchIcon });
    doubleClick(marker, getId(b));
    markers.push(marker.bindPopup(renderBench(b, marker)));
}
benchCg.addLayers(markers);


map.on('moveend', async () => {
    return;
    let sorted = benches.sort((a, b) => {
        let da = haversine(a.latitude, a.longitude, map.getCenter().lat, map.getCenter().lng);
        let db = haversine(b.latitude, b.longitude, map.getCenter().lat, map.getCenter().lng);
        return da - db;
    });



    sorted = parking.sort((a, b) => {
        let da = haversine(a.latitude, a.longitude, map.getCenter().lat, map.getCenter().lng);
        let db = haversine(b.latitude, b.longitude, map.getCenter().lat, map.getCenter().lng);
        return da - db;
    });

});

map.addLayer(bathroomCg);
map.addLayer(parkingCg);
map.addLayer(benchCg);




async function getBenches(bbox) {
    // Source: openstreetmap.org
    const query = `[out:json][timeout:25]; (node["amenity"="bench"](${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]});); out body;`;

    let resp = await (await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
    })).json();
    return resp.elements.map((bench) => {
        return {
            latitude: bench.lat,
            longitude: bench.lon,
            fields: {
                backrest: bench.tags.backrest,
            }
        };
    });
}

async function getBathrooms(bbox) {
    // Source: openstreetmap.org
    const query = `[out:json][timeout:25]; (node["amenity"="toilets"](${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]});); out body;`;

    let resp = await (await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
    })).json();
    resp.elements = resp.elements.filter((bathroom) => bathroom.tags.access != "no" && bathroom.tags.fee != "yes");
    return resp.elements.map((bathroom) => {
        return {
            latitude: bathroom.lat,
            longitude: bathroom.lon,
            fields: {
              unisex: bathroom.tags.unisex,
              wheelchair: bathroom.tags.wheelchair,
              osm: true,
            },
        };
    });
}
//for zip code search
async function zipZoom() {
    const zip = document.getElementById('zipSearch').value.trim();

    if (!zip) {
        alert("Please enter a ZIP code.");
        return;
    }

    try {
        const response = await fetch('zips.json');
        const zipData = await response.json();

        const location = zipData.find(entry => entry.zip === zip);

        if (!location) {
            alert("ZIP code not found.");
            return;
        }

        map.setView([location.latitude, location.longitude], 13);
    } catch (error) {
        console.error("Error fetching ZIP code data:", error);
        alert("An error occurred while searching for the ZIP code.");
    }
}

document.querySelector('.zip-zoom').addEventListener('click', zipZoom);

let addingFeature = false;
let instructionsViewed = false;

function addFeature() {
    if (!instructionsViewed) {
        alert("Click on the map where you'd like to add a new feature. You'll then be prompted to enter its details.");
        instructionsViewed = true;
    }
    addingFeature = true;
    map.getContainer().style.cursor = 'crosshair';
}

map.on('click', (e) => {
    if (!addingFeature) return;

    addingFeature = false;
    // Source: stackoverflow
    map.getContainer().style.cursor = '';

    const latlng = e.latlng;

    const container = document.createElement('div');
    container.innerHTML = `
        <form id="featureForm">
         <label>Type:
            <select name="type" id="featureType">
                <option value="bathroom">Bathroom</option>
                <option value="bench">Bench</option>
                <option value="parking">Parking</option>
        </select>
        </label>
        <div id="commonFields"></div>
        <div style="margin-top: 10px;">
                <button type="submit">Submit</button>
        </div>
        </form>
    `;

    const popup = L.popup().setLatLng(latlng).setContent(container).openOn(map);
    const form = container.querySelector('#featureForm');
    const typeSelect = container.querySelector('#featureType');
    const commonFields = container.querySelector('#commonFields');
    function updateFormFields() {
        const type = typeSelect.value;
        let fields = '';

        if (type === 'bathroom') {
            fields = `
            <label>Name: <input type="text" name="name" required /></label><br>
            <label>Address: <input type="text" name="address" required /></label><br>
            <label>Hours: <input type="text" name="hours" /></label><br>
                <label>Handicap Accessible: <input type="checkbox" name="handicap" /></label>
            `;
        } else if (type === 'bench') {
            fields = `
            <label>Backrest: <input type="checkbox" name="backrest" /></label>
            `;
        } else if (type === 'parking') {
            fields = `
            <label>Name: <input type="text" name="name" required /></label><br>
            <label>Address: <input type="text" name="address" required /></label><br>
            <label>Available Spaces: <input type="number" name="spaces" min="0" placeholder="Leave blank for N/A" /></label>
            `;
        }

        commonFields.innerHTML = fields;
    }

    typeSelect.addEventListener('change', updateFormFields);
    updateFormFields();

    form.addEventListener('submit', (eSubmit) => {
        // Source: stackoverflow
        eSubmit.preventDefault();

        // Source: MDN
        const data = new FormData(form);
        const type = data.get('type');
        const send = {
            type: type,
            latitude: latlng.lat,
            longitude: latlng.lng
        };

        if (type === 'bathroom') {
            send.name = data.get('name');
            send.address = data.get('address');
            send.hours = data.get('hours');
            send.handicap = data.get('handicap') === 'on';
        } else if (type === 'bench') {
            send.backrest = data.get('backrest') === 'on';
        } else if (type === 'parking') {
            send.name = data.get('name');
            send.address = data.get('address');
            const spaces = data.get('spaces');
            send.spaces = spaces ? Number(spaces) : 'N/A';
        }
        
        uploadFeature(send);
        alert("Feature submitted!");
        map.closePopup();
    });
});
document.querySelector('.add-feature').addEventListener('click', addFeature);

function doubleClick(marker, id) {
    let lastTapTime = 0;
    const doubleTapTime = 300;

    marker.on('dblclick', () => {
        doubleClickListener(id);
    });

    // source: stackoverflow
    // For mobile
    marker.on('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;

        if (tapLength < doubleTapTime && tapLength > 0) {
            doubleClickListener(id);
        }

        lastTapTime = currentTime;
    });
}

function doubleClickListener(id) {
    const input = prompt("Add more info about this feature:");
    if (input.trim()) { addAdditionalInfo(id, input.trim()); }
}