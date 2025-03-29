const mongoose = require('mongoose');

const rentalContractSchema = new mongoose.Schema(
    {
        landlord: {
            type: String,
            required: true,
        },
        tenant: {
            type: String,
            default: null,
        },
        rentAmount: {
            type: String, // Cambiado a String para manejar valores grandes en wei
            required: true,
        },
        securityDeposit: {
            type: String, // Cambiado a String para manejar valores grandes en wei
            required: true,
        },
        rentalPeriod: {
            type: Number,
            required: true,
        },
        startTime: {
            type: Date,
            default: null,
            get: (timestamp) => (timestamp ? new Date(timestamp * 1000) : null), // Transforma timestamp en fecha legible
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        contractAddress: {
            type: String,
            required: true,
        },
        events: [
            {
                eventType: {
                    type: String,
                    enum: [
                        'ContractSigned',
                        'RentPaid',
                        'FundsWithdrawn',
                        'ContractTerminated',
                    ],
                    required: true,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                details: {
                    type: mongoose.Schema.Types.Mixed,
                },
            },
        ],
    },
    {timestamps: true},
);

module.exports = mongoose.model('RentalContract', rentalContractSchema);
