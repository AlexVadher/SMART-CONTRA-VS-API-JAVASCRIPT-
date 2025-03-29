const express = require('express');
const {
    signContract,
    getAllContracts,
} = require('../controllers/rentaController');
const router = express.Router();

router.post('/sign', signContract); // Firmar contrato
router.get('/', getAllContracts); // Obtener todos los contratos

module.exports = router;
