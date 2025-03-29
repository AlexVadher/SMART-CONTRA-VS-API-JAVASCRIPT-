const ApartmentRental = artifacts.require('ApartmentRental');

module.exports = function (deployer, network, accounts) {
    const rentAmount = web3.utils.toWei('1', 'ether'); // 1 ETH como renta mensual
    const securityDeposit = web3.utils.toWei('2', 'ether'); // 2 ETH como depósito de seguridad
    const rentalPeriod = 60 * 60 * 24 * 30; // 30 días en segundos

    // Desplegar el contrato con los parámetros requeridos
    deployer.deploy(ApartmentRental, rentAmount, securityDeposit, rentalPeriod);
};
