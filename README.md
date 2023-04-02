### Setup

Register for free and create an [N2YO API Token](https://www.n2yo.com/login/).

Register for free and create a [Cesium Ion API Token](https://ion.cesium.com/).

Create a `.env` in the root directory and add your API tokens, replacing `n2yo-token` and cesium-token` with the relevant value:
```
export N2YO_TOKEN=n2yo-token
export CESIUM_TOKEN=cesium-token
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

The app will be running on port `8080`.