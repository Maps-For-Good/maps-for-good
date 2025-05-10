import bathrooms_ from './data/bathrooms/bathrooms.js';
import parking from './data/handicap-parking/handicap-parking.js'
let map = L.map('map').setView([42.3, -71.1], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

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

function getMapsLink(location) {
    let query = encodeURIComponent(`${location.latitude}, ${location.longitude} ${location.fields.name ?? ""}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function renderBathroom(br) {
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
            <h3>Bathroom</h3>
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


function renderBench(bench) {
    const googleMapsUrl = getMapsLink(bench);

    return `Bench
    <div>
        <strong>Backrest:</strong> ${bench.fields.backrest ?? "Maybe"}
    </div>
    `;

}

function renderParking(parking) {
    const googleMapsUrl = getMapsLink(parking);

    return `Handicap Parking Spot
    <div>
        ${parking.fields.address}
    </div>
    `;
}
let bounds = map.getBounds();
let bbox = [41.51507, -73.50825, 42.89785, -69.92896];
const bathrooms = bathrooms_.concat(await getBathrooms(bbox));
let markers = [];
for (const b of bathrooms) {
    let latlng = L.latLng(b.latitude, b.longitude);
    markers.push(L.marker(latlng, { icon: bathroomIcon }).bindPopup(renderBathroom(b)));
}
bathroomCg.addLayers(markers);

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

function onMapClick(e) {
    return;
    let say = prompt('What do you want to add?')

    L.marker(e.latlng).addTo(map)
        .bindPopup(say)
        .openPopup();
}
map.on('click', onMapClick);


const benches = await getBenches(bbox);
markers = [];
for (let i = 0; i < parking.length; i++) {
    const p = parking[i];
    let latlng = L.latLng(p.latitude, p.longitude);
    markers.push(L.marker(latlng, { icon: parkingIcon }).bindPopup(renderParking(p)));
}
parkingCg.addLayers(markers);

markers = [];
for (let i = 0; i < benches.length; i++) {
    const b = benches[i];
    const latlng = L.latLng(b.latitude, b.longitude);
    markers.push(L.marker(latlng, { icon: benchIcon })
        .bindPopup(renderBench(b)));
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