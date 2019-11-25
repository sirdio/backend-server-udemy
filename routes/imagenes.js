// Requieres
var express = require('express');

const path = require('path');
const fs = require('fs');

// Inicializar Variables
var app = express();


// Rutas
app.get('/:tipo/:img', (req, res, next) => {
    var tipo = req.params.tipo;
    var img = req.params.img;
    var pathimagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);
    if (fs.existsSync(pathimagen)) {
        res.sendFile(pathimagen);
    } else {
        var notImagen = path.resolve(__dirname, `../assets/no-img.jpg`);
        res.sendFile(notImagen);
    }
});




module.exports = app;