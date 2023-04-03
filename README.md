 Satellite Tracker that uses the [`Cesium`](https://cesium.com/) & [`satellite.js`](https://github.com/shashwatak/satellite-js) libraries with the [`N2YO API`](https://www.n2yo.com/) to show a live feed of satellites.

 The app makes one request for each satellite every hour to the N2YO API to get the [TLE](https://en.wikipedia.org/wiki/Two-line_element_set) data. It then uses the latest TLE data to derive the current location of each satellite and update the location of the entities in the Cesium viewer every second.

 The request to the N2YO API needs to be made through a proxy server, to fix a CORS error. This proxy server runs in a separate container.

[![Screenshot](https://i.imgur.com/RUZaLok.png)](https://i.imgur.com/RUZaLok.png)

### Setup

Register for free and create an [N2YO API Token](https://www.n2yo.com/login/).

Register for free and create a [Cesium Ion API Token](https://ion.cesium.com/).

Create a `.env` in the root directory and add your API tokens, replacing `n2yo-token` and cesium-token` with the relevant value, and `localhost` with your server IP or domain if not running locally:
```
API_BASE_URL=http://localhost:4002
N2YO_API_KEY=n2yo-token
CESIUM_ION_ACCESS_TOKEN=cesium-token
```

Install [Docker](https://docs.docker.com/engine/install/) with docker compose.

Clone the repo:
```
git clone git@github.com:dop-amine/sat-tracker.git
```

Run the container:
```
docker compose up -d
```

The app will be running on port `1122`.