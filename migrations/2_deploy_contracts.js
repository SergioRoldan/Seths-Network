var CryptoHandler = artifacts.require("./CryptoHandler.sol");
var Factory = artifacts.require("./Factory.sol");

module.exports = function(deployer) {
  deployer.deploy(CryptoHandler);
  deployer.link(CryptoHandler, Factory)
  deployer.deploy(Factory);
};
