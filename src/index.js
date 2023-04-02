import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "../src/css/main.css";
const axios = require("axios");
const satellite = require("satellite.js");

// N2YO API endpoint for TLE data
const apiBaseUrl = process.env.API_BASE_URL;
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
    const noradIDs = [
      25544, // International Space Station
      25338, // Globalstar M045
      36516, // GPS IIF-1
      37763, // GPS IIF-2
      38833, // GPS IIF-3
      40105, // GPS IIF-5
      40534, // GPS IIF-6
      40730, // GPS IIF-7
      41019, // GPS IIF-8
      41328, // GPS IIF-9
      41859, // GPS IIF-11
      43001, // GPS IIF-12
      22700, // NOAA 15
      23581, // NOAA 16
      25338, // NOAA 18
      28654, // NOAA 19
      27424, // GOES 13
      32382, // GOES 14
      36411, // GOES 15
      32952, // Meteosat-9
      40732, // Meteosat-8
      27453, // Terra
      28380, // Aqua
      35491, // Landsat 5
      39084, // Landsat 8
      20625, // ERS-1
      22823, // ERS-2
      23560, // RADARSAT-1
      27602, // ENVISAT
      36105, // RADARSAT-2
      36605, // SARAL
      38093, // Sentinel-1A
      40376, // Sentinel-1B
      42063, // Sentinel-2B
      36605, // SARAL
      41335, // Sentinel-3A
      43189, // Sentinel-3B
      27424, // GOES 13
      32382, // GOES 14
      36411, // GOES 15
      41622, // SES-9
      38867, // SES-8
      25413, // ABS-3
      33053, // ABS-2
      36499, // ABS-2A
      41026, // SES-15
      40880, // Intelsat 29e
      40425, // Intelsat 34
      41747, // Intelsat 35e
      41866, // Intelsat 37e
    ]

    for (const noradID of noradIDs) {
      const response = await axios.get(`${apiBaseUrl}/api/tle/${noradID}?apiKey=${n2yoApiKey}`);

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