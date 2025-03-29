import SHA256 from 'crypto-js/sha256.js';
import BlockModel from '../models/BlockModel.js'; // Asegúrate de que este modelo exista
import RentalContract from '../models/RentalContract.js'; // Modelo de contrato de alquiler

class Blockchain {
    constructor() {
        this.chain = [];
        this.height = -1;
        this.initializeChain();
    }

    async initializeChain() {
        const blocks = await BlockModel.find().sort({height: 1});
        if (blocks.length > 0) {
            this.chain = blocks;
            this.height = blocks.length - 1;
        } else {
            const genesisBlock = {
                data: 'Genesis Block',
                height: 0,
                time: new Date().getTime().toString(),
                previousBlockHash: null,
                hash: SHA256('Genesis Block').toString(),
            };
            await this.save(genesisBlock);
            this.chain.push(genesisBlock);
            this.height = 0;
        }
    }

    async addBlock(data) {
        const block = {
            height: this.chain.length,
            time: new Date().getTime().toString(),
            data,
            previousBlockHash:
                this.chain.length > 0
                    ? this.chain[this.chain.length - 1].hash
                    : null,
        };

        // Validar la cadena antes de agregar el bloque
        const errors = await this.validateChain();
        if (errors.length > 0) {
            throw new Error(`The chain is not valid: ${errors}`);
        }

        // Calcular el hash del bloque
        block.hash = SHA256(JSON.stringify(block)).toString();

        // Guardar el bloque en la base de datos
        await this.save(block);

        // Agregar el bloque a la cadena
        this.chain.push(block);
        this.height = this.chain.length - 1;

        return block;
    }

    async validateChain() {
        const errors = [];
        for (const block of this.chain) {
            const isValid = await this.validateBlock(block);
            if (!isValid) {
                errors.push(`Block ${block.height} is invalid`);
            }
        }
        return errors;
    }

    async validateBlock(block) {
        const recalculatedHash = SHA256(
            JSON.stringify({
                height: block.height,
                time: block.time,
                data: block.data,
                previousBlockHash: block.previousBlockHash,
            }),
        ).toString();
        return block.hash === recalculatedHash;
    }

    async save(block) {
        const blockData = new BlockModel(block);
        await blockData.save();
    }

    async addRentalContract(contractId) {
        // Obtener los datos del contrato de alquiler
        const contract = await RentalContract.findById(contractId);
        if (!contract) {
            throw new Error('Contract not found');
        }

        // Agregar el contrato como un bloque en la cadena
        const block = await this.addBlock({
            contractId: contract._id,
            landlord: contract.landlord,
            tenant: contract.tenant,
            rentAmount: contract.rentAmount,
            securityDeposit: contract.securityDeposit,
            rentalPeriod: contract.rentalPeriod,
            startTime: contract.startTime,
            isActive: contract.isActive,
        });

        return block;
    }

    print() {
        for (const block of this.chain) {
            console.log(block);
        }
    }
}

export default Blockchain;
