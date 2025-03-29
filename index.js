const express = require('express');
const connect = require('./config/db.js'); // Conexión a la base de datos
const dotenv = require('dotenv');
const rentaRouter = require('./routes/rentaRoutes.js'); // Rutas para contratos de renta
const paymentRouter = require('./routes/paymentRoutes.js'); // Rutas para pagos

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware para que el servidor entienda JSON
app.use(express.json());

// Middleware para las rutas
app.use('/api/renta', rentaRouter); // Rutas relacionadas con contratos de renta
app.use('/api/payment', paymentRouter); // Rutas relacionadas con pagos

// Ruta principal
app.get('/', (req, res) => {
    res.send('API de Alquiler');
});

// Configuración del servidor
const server = async () => {
    try {
        // Conectar a la base de datos
        await connect();
        console.log('Conexión exitosa a la base de datos');

        // Iniciar el servidor
        app.listen(port, () => {
            console.log(`Servidor corriendo en el puerto ${port}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
    }
};

server(); // Inicia el servidor
