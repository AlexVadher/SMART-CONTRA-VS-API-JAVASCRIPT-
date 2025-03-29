const {Web3} = require('web3');

// Configura la conexión a la red (por ejemplo, Ganache)
const web3 = new Web3('http://127.0.0.1:7545'); // Cambia la URL según tu red

module.exports = web3;
