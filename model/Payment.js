const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    contractId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RentalContract', // Referencia al contrato de alquiler
        required: true,
    },
    tenant: {
        type: String, // Dirección del inquilino
        required: true,
        validate: {
            validator: function (v) {
                return /^0x[a-fA-F0-9]{40}$/.test(v); // Validar que sea una dirección Ethereum
            },
            message: (props) =>
                `${props.value} no es una dirección Ethereum válida`,
        },
    },
    amount: {
        type: Number, // Monto del pago
        required: true,
        min: [0, 'El monto del pago debe ser mayor que 0'],
    },
    timestamp: {
        type: Date, // Fecha y hora del pago
        default: Date.now,
    },
    details: {
        type: String, // Detalles adicionales del pago
        default: null,
    },
});

module.exports = mongoose.model('Payment', paymentSchema);
