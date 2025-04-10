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

function getMapsLink(locationFields) {
    let query = encodeURIComponent(`${locationFields.latitude}, ${locationFields.longitude} ${locationFields.name}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function renderBathroom(fields) {
    const googleMapsUrl = getMapsLink(fields);

    return `
            <h3>${fields.name}</h3>
            <a href="${googleMapsUrl}" target="_blank">
                Open in Google Maps
            </a>
            <div>
                <strong>Hours:</strong> ${fields.hours}
            </div>
        `;
}

let benchIcon = L.icon({
    iconUrl: 'icons/bench.png',
   // shadowUrl: 'icons/bench.png',

    iconSize:     [58, 58], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

function renderBench(fields) {
    const googleMapsUrl = getMapsLink(fields);
    console.log(fields)
    
    return `Bench
    <div>
        <strong>Backrest:</strong> ${fields.tags.backrest ?? "Maybe"}
    </div>
    `;
}

fetch('bathrooms.json').then((r) => r.json()).then(async markers => {
    let markerGroup = L.featureGroup([]).addTo(map);

    for (const key in markers) {
        let latlng = L.latLng(markers[key].latitude, markers[key].longitude);
        L.marker(latlng).bindPopup(renderBathroom(markers[key])).addTo(markerGroup);
    }
    setInterval(() => {
        let sorted = Object.keys(markers).sort((a, b) => {
            let da = haversine(markers[a].latitude, markers[a].longitude, map.getCenter().lat, map.getCenter().lng);
            let db = haversine(markers[b].latitude, markers[b].longitude, map.getCenter().lat, map.getCenter().lng);
            return da - db;
        });
        const grid = document.querySelector('.footer-scroll-grid');
        while (grid.firstChild) {
            grid.removeChild(grid.lastChild);
        }
        for (const key of sorted) {
            const entry = document.createElement('a');
            entry.href = getMapsLink(markers[key]);
            entry.setAttribute('target', '_blank');
            const title = document.createElement('h4');
            const desc = document.createElement('p');
            title.textContent = markers[key].name;

            let dist = haversine(markers[key].latitude, markers[key].longitude, map.getCenter().lat, map.getCenter().lng);
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
    let say = prompt('What do you want to add?')

    L.marker(e.latlng).addTo(map)
        .bindPopup(say)
        .openPopup();
}

map.on('click', onMapClick);
map.on('moveend', async () => {
    let bounds = map.getBounds();
    let bbox = [bounds._southWest.lat, bounds._southWest.lng, bounds._northEast.lat, bounds._northEast.lng];
    const benches = await getBenches(bbox);
    let markerGroup = L.featureGroup([]).addTo(map);
    let sorted = benches.sort((a, b) => {
        let da = haversine(a.lat, a.lon, map.getCenter().lat, map.getCenter().lng);
        let db = haversine(b.lat, b.lon, map.getCenter().lat, map.getCenter().lng);
        return da - db;
    });

    for (let i = 0; i < 100; i++) {
        const b = sorted[i];
        let latlng = L.latLng(b.lat, b.lon);
        L.marker(latlng, {icon: benchIcon}).bindPopup(renderBench(b)).addTo(markerGroup);
    }
});

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
    return resp.elements;
}