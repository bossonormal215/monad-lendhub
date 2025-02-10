// constructor-args.js
module.exports = [
  '0x2880aB155794e7179c9eE2e38200202908C17B43', // pythAddress on monad devnet
  '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', // priceFeedId
];

// curl -s "https://hermes.pyth.network/v2/updates/price/latest?&ids[]=$0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace" | jq -r ".binary.data[0]" > price_update.txt
