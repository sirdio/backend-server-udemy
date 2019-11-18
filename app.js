// Requieres
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');



// Importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');


// Inicializar Variables
var app = express();




// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



// Conexion base de datos

// mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true });

mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'online');
});





//rutas
app.use('/login', loginRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3000, () => {
    console.log('Expresr Server ports 3000: \x1b[32m%s\x1b[0m', 'online');
});