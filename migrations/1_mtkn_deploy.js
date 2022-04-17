const MTKN = artifacts.require("MTKN");

module.exports = function (deployer) {
  deployer.deploy(MTKN, "Mock Token", "MTKN", 18, 100000);
};
