const express = require('express');
const {
    payRent,
    getPaymentsByContract,
    getBalance,
    withdrawFunds,
} = require('../controllers/rentaController');
const router = express.Router();

router.post('/pay', payRent); // Realizar un pago
router.get('/:contractId', getPaymentsByContract); // Obtener pagos por contrato
router.get('/balance', getBalance); // Consultar balance del contrato
router.post('/withdraw', withdrawFunds); // Retirar fondos del contrato

module.exports = router;
