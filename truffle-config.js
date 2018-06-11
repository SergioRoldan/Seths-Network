
module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*', // Match any network id
      gas: 4700000
    }, geth: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      gas: 4700000
    }, ropsten: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '3', //Match ropsten official id
      gas: 4700000
    }
  },
  solc: {
    optimizer: {
      enabled: true,  //enable 200 runs (default value, more runs increase the resultant bytecode) solidity compiler optimization
                      // at assembly level working with opcodes to reduce the gas usage to the minimum limit, for production purposes
      runs: 200
    }
  }
}
