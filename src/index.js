import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "../src/css/main.css";
const axios = require("axios");
const satellite = require("satellite.js");

// N2YO API endpoint for TLE data
const n2yoBaseUrl = 'http://localhost:4002/api';
const n2yoApiKey = process.env.N2YO_API_KEY;
Cesium.Ion.defaultAccessToken = process.env.CESIUM_ION_ACCESS_TOKEN;

// Initialize the Cesium Viewer in the HTML element
const viewer = new Cesium.Viewer("cesiumContainer");

// Add Cesium OSM Buildings
viewer.scene.primitives.add(Cesium.createOsmBuildings());

// Update the position of all satellites immediately when the app starts up
updateTLEData().then(() => {
  updateSatellitePositions();

  // Update the position of all satellites every second
  setInterval(updateSatellitePositions, 1000);
});

// API call to update TLE data every hour (N2YO limit of 1000 requests per hour)
setInterval(updateTLEData, 3600000);

// Initialize an empty array to store satellite entities
const satelliteEntities = [];

// Update the position of all satellites
function updateSatellitePositions() {
  const currentDate = new Date();

  for (const satelliteEntity of satelliteEntities) {
    const { line1, line2 } = satelliteEntity.tle;
    const satrec = satellite.twoline2satrec(line1, line2);

    const positionAndVelocity = satellite.propagate(satrec, currentDate);
    const positionEci = positionAndVelocity.position;
    const gmst = satellite.gstime(currentDate);
    const positionGd = satellite.eciToGeodetic(positionEci, gmst);
    const longitude = satellite.degreesLong(positionGd.longitude);
    const latitude = satellite.degreesLat(positionGd.latitude);
    const altitude = positionGd.height;

    // Update the existing satellite entity's position
    satelliteEntity.position = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
  }
}

async function updateTLEData() {
  try {
    const noradIDs = [25544, 36516, 33591, 29155, 25338];

    for (const noradID of noradIDs) {
      const response = await axios.get(`${n2yoBaseUrl}/tle/${noradID}?apiKey=${n2yoApiKey}`);

      // Check if the response contains TLE data
      if (response.data && response.data.tle) {
        const tleLines = response.data.tle.split("\n");
        const line1 = tleLines[0];
        const line2 = tleLines[1];

        // Check if the satellite entity already exists in the array
        let satelliteEntity = satelliteEntities.find(entity => entity.id === noradID);

        // If the satellite entity doesn't exist, create it and add it to the viewer and satelliteEntities array
        if (!satelliteEntity) {
          satelliteEntity = viewer.entities.add({
            id: noradID,
            name: response.data.info.satname,
            position: Cesium.Cartesian3.ZERO, // Temporary position, it will be updated in updateSatellitePositions()
            billboard: {
              image: "assets/satellite.png",
              scale: 0.05,
            },
          });

          satelliteEntities.push(satelliteEntity);
        }

        // Update the TLE data for the satellite entity
        satelliteEntity.tle = { line1, line2 };
      } else {
        console.error("Invalid TLE data format for NORAD ID", noradID, ":", response.data);
      }
    }
  } catch (error) {
    console.error(error);
  }
}