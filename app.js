// Requieres
var express = require('express');
var mongoose = require('mongoose');


// Inicializar Variables
var app = express();



// Conexion base de datos
mongoose.connection.openUri('mongodb://localhost:/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'online');
});





//rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});


// Escuchar peticiones
app.listen(3000, () => {
    console.log('Expresr Server ports 3000: \x1b[32m%s\x1b[0m', 'online');
});