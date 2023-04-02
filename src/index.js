import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "../src/css/main.css";
const axios = require("axios");
const satellite = require("satellite.js");

// N2YO API endpoint for TLE data
const n2yoBaseUrl = 'http://localhost:4002/api';
const n2yoApiKey = "6MJ779-GQHBQ3-YV4T9H-50H2";

// Cesium access token
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyNzg0NTE4Mn0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk";

// Initialize the Cesium Viewer in the HTML element
const viewer = new Cesium.Viewer("cesiumContainer");

// Add Cesium OSM Buildings
viewer.scene.primitives.add(Cesium.createOsmBuildings());

// Update the position of all satellites immediately when the app starts up
updateSatellitePositions();

// Update the position of all satellites every hour (N2YO limit of 1000 requests per hour)
setInterval(updateSatellitePositions, 60 * 60 * 1000);

// Update the position of all satellites
async function updateSatellitePositions() {
  try {
    const noradIDs = [25544, 36516, 33591, 29155, 25338];

    // Fetch TLE data for each satellite from N2YO API
    for (const noradID of noradIDs) {
      const response = await axios.get(`${n2yoBaseUrl}/tle/${noradID}?apiKey=${n2yoApiKey}`);
      console.log(response.data);

      // Check if the response contains TLE data
      if (response.data && response.data.tle) {
        const tleLines = response.data.tle.split("\n");
        const line1 = tleLines[0];
        const line2 = tleLines[1];
        const satrec = satellite.twoline2satrec(line1, line2);

        const positionAndVelocity = satellite.propagate(satrec, new Date());
        const positionEci = positionAndVelocity.position;
        const gmst = satellite.gstime(new Date());
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);
        const longitude = satellite.degreesLong(positionGd.longitude);
        const latitude = satellite.degreesLat(positionGd.latitude);
        const altitude = positionGd.height;

        const satelliteEntity = viewer.entities.add({
          name: response.data.info.satname,
          position: Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude),
          billboard: {
            image: "assets/satellite.png",
            scale: 0.05,
          },
        });

        satelliteEntity.position = Cesium.Cartesian3.fromDegrees(
          longitude,
          latitude,
          altitude
        );
      } else {
        console.error("Invalid TLE data format for NORAD ID", noradID, ":", response.data);
      }
    }
  } catch (error) {
    console.error(error);
  }
}
