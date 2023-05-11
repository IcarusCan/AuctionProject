const Auction = artifacts.require("Auction");

module.exports = function (deployer) {
    // Deploy Auction Contract with  startingPrice=50 and step=5
    deployer.deploy(Auction, 50, 5);
};