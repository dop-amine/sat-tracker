import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "../src/css/main.css"
const satellite = require('satellite.js');

// const tleLine1 = '1 25544U 98067A   21305.82561019  .00001334  00000+0  61267-4 0  9998';
// const tleLine2 = '2 25544  51.6413 351.3817 0009373  30.8539  58.8257 15.50216137362383';

// const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

// Cesium access token
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyNzg0NTE4Mn0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk';

// Initialize the Cesium Viewer in the HTML element
const viewer = new Cesium.Viewer('cesiumContainer');

// Add Cesium OSM Buildings
viewer.scene.primitives.add(Cesium.createOsmBuildings());


// Define the TLE values of the satellite
const satTLE = {
  name: 'ISS (ZARYA)',
  line1: '1 25544U 98067A   21091.62677821  .00002762  00000-0  65933-4 0  9995',
  line2: '2 25544  51.6445 103.3366 0004704  45.7084  32.0459 15.48907119278754'
};

// Create a satellite object using the TLE values
const satrec = satellite.twoline2satrec(satTLE.line1, satTLE.line2);

// Create a Cesium Entity object to represent the satellite
const satelliteEntity = viewer.entities.add({
  name: satTLE.name,
  position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
  billboard: {
    image: 'assets/satellite.png',
    scale: 0.05,
  },
});

// Update the position of the entity every second
setInterval(updateSatellitePosition, 1000);

// Update the position of the entity
function updateSatellitePosition() {
  const now = new Date();
  const positionAndVelocity = satellite.propagate(satrec, now);
  const positionEci = positionAndVelocity.position;
  const gmst = satellite.gstime(now);
  const positionGd = satellite.eciToGeodetic(positionEci, gmst);
  const longitude = satellite.degreesLong(positionGd.longitude);
  const latitude = satellite.degreesLat(positionGd.latitude);
  const altitude = positionGd.height;

  // Set the position of the entity
  satelliteEntity.position = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
}