const parking = (await (await fetch('./data/handicap-parking/handicap-parking-boston.json')).json()).features.map(p => {
  return {
    latitude: p.attributes.latitude,
    longitude: p.attributes.longitude,
    fields: {
      address: p.attributes.address_full,
    }
  }
});
const cambridge = (await (await fetch('./data/handicap-parking/handicap-parking-cambridge.json')).json()).features.map(p => {
  return {
    latitude: p.geometry.coordinates[1],
    longitude: p.geometry.coordinates[0],
    fields: {address: p.properties.StreetNumber ? `${p.properties.StreetNumber} ${p.properties.StreetName}` : p.properties.StreetName},
  };
});
const other = (await (await fetch('./data/handicap-parking/handicap-parking-other.json')).json()).map(p => {
  return {
    latitude: p.latitude,
    longitude: p.longitude,
    // ap = available parking
    fields: {address: p.address_full, ap_sp: p.number_of_ap_spaces, name: p.commercial_area},
  };
});
parking.push(...cambridge);
parking.push(...other);

export default parking;