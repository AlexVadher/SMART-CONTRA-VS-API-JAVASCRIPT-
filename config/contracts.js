const web3 = require('./web3'); // Importa la instancia de Web3
const fs = require('fs');
const path = require('path');

// Ruta al archivo JSON del contrato
const contractPath = path.resolve(
    __dirname,
    '../build/contracts/ApartmentRental.json',
);

// Leer y parsear el archivo JSON del contrato
const contractJSON = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const abi = contractJSON.abi; // ABI del contrato
const address = '0xbDAceF8aBAf0D3BFf464F104B9b99bE9c5DE4c6e'; // Dirección del contrato desplegado

// Crear una instancia del contrato
const ContractRental = new web3.eth.Contract(abi, address);

module.exports = ContractRental;
