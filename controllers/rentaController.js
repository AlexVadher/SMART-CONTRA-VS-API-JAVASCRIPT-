const rentalContract = require('../config/contracts.js'); // Instancia del contrato inteligente
const RentalContract = require('../model/Renta.js'); // Modelo de MongoDB para contratos
const Payment = require('../model/Payment.js'); // Modelo de MongoDB para pagos
const BN = require('bn.js'); // Importa BN directamente desde bn.js
const {Web3} = require('web3');
const web3 = require('../config/web3.js');
// Alquilar (firmar contrato)
const signContract = async (req, res) => {
    try {
        const {
            landlord,
            tenant,
            rentAmount,
            securityDeposit,
            rentalPeriod,
            contractAddress,
        } = req.body;

        console.log('Datos del contrato:', req.body);

        // Validar direcciones de Ethereum
        if (!web3.utils.isAddress(landlord) || !web3.utils.isAddress(tenant)) {
            return res
                .status(400)
                .send(
                    'Las direcciones del propietario o inquilino no son válidas',
                );
        }

        // Verificar si el contrato ya está activo
        const isActive = await rentalContract.methods.isActive().call();
        if (isActive) {
            console.log('El contrato ya está activo. Guardando en MongoDB...');
            const rental = new RentalContract({
                landlord,
                tenant,
                rentAmount,
                securityDeposit,
                rentalPeriod,
                contractAddress,
                isActive: true,
                startTime: new Date(),
            });

            await rental.save();

            return res.status(200).send({
                message:
                    'El contrato ya estaba activo, pero se guardó en la base de datos',
                rental,
            });
        }

        // Validar que los valores estén en wei y sean cadenas numéricas
        if (!BN.isBN(new BN(rentAmount)) || !BN.isBN(new BN(securityDeposit))) {
            return res
                .status(400)
                .send(
                    'Los valores de rentAmount y securityDeposit deben ser números en wei representados como cadenas',
                );
        }

        // Ejecutar la transacción
        await rentalContract.methods.signContract().send({
            from: tenant,
            value: web3.utils.toWei(securityDeposit, 'wei'),
            gas: 3000000,
        });

        // Guardar el contrato en la base de datos
        const rental = new RentalContract({
            landlord,
            tenant,
            rentAmount,
            securityDeposit,
            rentalPeriod,
            contractAddress,
            isActive: true,
            startTime: new Date(),
        });

        await rental.save();

        res.status(201).send({
            message: 'Contrato firmado exitosamente',
            rental,
        });
    } catch (error) {
        console.error('Error al firmar el contrato:', error);

        // Manejar errores específicos del contrato
        if (error.message.includes('El contrato ya esta activo')) {
            console.log('El contrato ya está activo. Guardando en MongoDB...');
            const rental = new RentalContract({
                landlord,
                tenant,
                rentAmount,
                securityDeposit,
                rentalPeriod,
                contractAddress,
                isActive: true,
                startTime: new Date(),
            });

            await rental.save();

            return res.status(200).send({
                message:
                    'El contrato ya estaba activo, pero se guardó en la base de datos',
                rental,
            });
        }

        res.status(500).send({error: error.message});
    }
};
// Realizar un pago de renta
const payRent = async (req, res) => {
    try {
        const {contractId, tenant, rentAmount} = req.body;

        console.log('Datos recibidos en la solicitud:', req.body);

        // Validar dirección del inquilino
        if (!web3.utils.isAddress(tenant)) {
            return res
                .status(400)
                .send('La dirección del inquilino no es válida');
        }

        // Verificar si el contrato existe
        const contract = await RentalContract.findById(contractId);
        if (!contract) {
            return res.status(404).send('Contrato no encontrado');
        }

        // Validar que el valor de rentAmount esté presente y sea una cadena
        if (!rentAmount || typeof rentAmount !== 'string') {
            return res
                .status(400)
                .send('El valor de rentAmount es inválido o no fue enviado');
        }

        // Validar que el monto de la renta coincida con el monto guardado en la base de datos
        if (contract.rentAmount !== rentAmount) {
            console.log(
                'Comparación de montos de renta:',
                'rentAmount (enviado):',
                rentAmount,
                'contract.rentAmount (registrado):',
                contract.rentAmount,
            );
            return res
                .status(400)
                .send(
                    `El monto de la renta no coincide con el monto registrado en el contrato. Enviado: ${rentAmount}, Registrado: ${contract.rentAmount}`,
                );
        }

        // Interactuar con el contrato inteligente
        await rentalContract.methods.payRent().send({
            from: tenant,
            value: web3.utils.toWei(rentAmount, 'wei'), // Convertir a wei
            gas: 3000000, // Límite de gas
        });

        // Registrar el pago en la base de datos
        const payment = new Payment({
            contractId,
            tenant,
            amount: rentAmount,
        });

        await payment.save();

        res.status(200).send({message: 'Renta pagada exitosamente', payment});
    } catch (error) {
        console.error('Error al pagar la renta:', error);

        // Manejar errores específicos del contrato
        if (error.message.includes('revert')) {
            return res
                .status(400)
                .send({error: 'Error del contrato: ' + error.message});
        }

        res.status(500).send({error: error.message});
    }
};
// Retirar fondos del contrato
const withdrawFunds = async (req, res) => {
    try {
        const {landlord} = req.body;

        // Validar dirección del propietario
        if (!web3.utils.isAddress(landlord)) {
            return res
                .status(400)
                .send('La dirección del propietario no es válida');
        }

        // Ejecutar la transacción para retirar fondos
        await rentalContract.methods.withdrawFunds().send({
            from: landlord,
            gas: 3000000, // Límite de gas
        });

        res.status(200).send({
            message: 'Fondos retirados exitosamente',
        });
    } catch (error) {
        console.error('Error al retirar los fondos:', error);
        res.status(500).send({error: error.message});
    }
};

// Consultar el balance del contrato
const getBalance = async (req, res) => {
    try {
        const balance = await web3.eth.getBalance(contractAddress); // Dirección del contrato
        const balanceInEther = web3.utils.fromWei(balance, 'ether'); // Convertir de wei a ether

        res.status(200).send({
            contractAddress,
            balance: balanceInEther,
        });
    } catch (error) {
        console.error('Error al consultar el balance del contrato:', error);
        res.status(500).send({error: error.message});
    }
};

// Obtener todos los contratos
const getAllContracts = async (req, res) => {
    try {
        const contracts = await RentalContract.find();
        res.status(200).send(contracts);
    } catch (error) {
        console.error('Error al obtener los contratos:', error);
        res.status(500).send({error: error.message});
    }
};

// Obtener pagos por contrato
const getPaymentsByContract = async (req, res) => {
    try {
        const {contractId} = req.params;

        const payments = await Payment.find({contractId});
        if (!payments.length) {
            return res
                .status(404)
                .send('No se encontraron pagos para este contrato');
        }

        res.status(200).send(payments);
    } catch (error) {
        console.error('Error al obtener los pagos:', error);
        res.status(500).send({error: error.message});
    }
};

module.exports = {
    signContract,
    payRent,
    withdrawFunds,
    getBalance,
    getAllContracts,
    getPaymentsByContract,
};
