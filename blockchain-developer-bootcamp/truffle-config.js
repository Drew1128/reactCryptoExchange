require('babel-register');
require('babel-polyfill');
require('dotenv').config();


module.exports = {
 

  networks: {
   development: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "*"  // match any network id
       }
  },
  contracts_directory: './src/contracts',
  contracts_build_directory: './src/abis/',

  compilers: {
    // Solidity is a compiled language -- All the smart contracts have to be compiled down to byte code to be exucuted on the EVM 
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },

};
