const data = await (await fetch('./data/bathrooms/bathrooms.json')).json();
const bathrooms = data.map(b => {
    const { latitude, longitude, ...fields } = b;
    return {
        latitude, longitude, fields
    }
});
export default bathrooms;