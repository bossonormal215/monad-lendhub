const axios = require('axios');

async function fetchPriceUpdate() {
  const priceFeedId =
    '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace';
  const url = `https://hermes.pyth.network/v2/updates/price/latest?&ids[]=${priceFeedId}`;

  try {
    const response = await axios.get(url);
    const priceUpdateData = response.data.binary.data[0]; // Extract the first element from the data array

    // Write the price update data to a file
    const fs = require('fs');
    fs.writeFileSync('price_update.txt', priceUpdateData, { encoding: 'utf8' });

    console.log('Price update data saved to price_update.txt');
  } catch (error) {
    console.error('Error fetching price update:', error);
  }
}

fetchPriceUpdate();

module.exports = { fetchPriceUpdate };
