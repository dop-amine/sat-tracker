const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

app.use(cors());

app.use('/api', createProxyMiddleware({
  target: 'https://api.n2yo.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/rest/v1/satellite',
  },
}));

app.listen(4002, () => {
  console.log('Proxy server running on port 4002');
});


// Example URL: https://api.n2yo.com/rest/v1/satellite/tle/25544\&apiKey\=APIKEY