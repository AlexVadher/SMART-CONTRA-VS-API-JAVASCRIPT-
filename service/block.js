import SHA256 from 'crypto-js/sha256.js';
import hex2ascii from 'hex2ascii';

class Block {
    constructor(data) {
        this.hash = null; // Hash del bloque
        this.height = 0; // Altura del bloque en la cadena
        this.body = Buffer.from(JSON.stringify(data).toString('hex')); // Datos del bloque codificados
        this.time = 0; // Marca de tiempo del bloque
        this.previousBlockHash = ''; // Hash del bloque anterior
    }

    // Validar el bloque verificando su hash
    validate() {
        const self = this;
        return new Promise((resolve, reject) => {
            let currentHash = self.hash;
            // Recalcular el hash del bloque
            self.hash = SHA256(
                JSON.stringify({...self, hash: null}),
            ).toString();
            // Comparar el hash recalculado con el actual
            if (currentHash !== self.hash) {
                return resolve(false);
            }
            resolve(true);
        });
    }

    // Obtener los datos del bloque decodificados
    getBlockData() {
        const self = this;
        return new Promise((resolve, reject) => {
            try {
                let encodedData = self.body;
                let decodedData = hex2ascii(encodedData); // Decodificar los datos
                let dataObject = JSON.parse(decodedData);
                // Verificar si es el bloque génesis
                if (dataObject === 'Genesis Block') {
                    reject(new Error('This is the Genesis Block'));
                }
                resolve(dataObject);
            } catch (error) {
                reject(new Error('Failed to decode block data'));
            }
        });
    }

    // Representación del bloque como cadena
    toString() {
        const {hash, height, body, time, previousBlockHash} = this;
        return `Block -
         hash: ${hash}, 
         height: ${height}, 
         body: ${hex2ascii(body)}, 
         time: ${time}, 
         previousBlockHash: ${previousBlockHash} 
         ---------------------------------------------`;
    }
}

export default Block;
