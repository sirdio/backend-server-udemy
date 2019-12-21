// Requieres
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');
// Inicializar Variables
var app = express();

var Usuario = require('../models/usuario');
////var SEED = require('../config/config').SEED;
//========================================
// Obtener todos los usuarios 
//========================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Usuario.find({}, ' nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Usuarios',
                        errors: err
                    });
                }
                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });
                });

            }
        );

});
//// comentamos esto para pasarlo a otro archivo y hacerlo mas flexible
////  pero lo dejo aca para otras referenciassss
// //========================================
// // Verificar ToKen "Middleware"
// //========================================
// app.use('/', (req, res, next) => {
//     var token = req.query.token;
//     jwt.verify(token, SEED, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({
//                 ok: false,
//                 mensaje: " Token incorrecto ",
//                 errors: err
//             });
//         }
//         next();
//     });
// });





//========================================
// Actualizar Usuario
//========================================
app.put('/:id', [ mdAutenticacion.verificaToken, mdAutenticacion.verificaRolMismoUsuario ], (req, res) => {

    var id = req.params.id;
    var body = req.body;
    Usuario.findById(id, (err, usuariodb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario.",
                errors: err
            });
        }
        if (!usuariodb) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id: ${id} no existe`,
                errors: { menssage: "No existe usuario con ese ID" }
            });
        }
        usuariodb.nombre = body.nombre;
        usuariodb.email = body.email;
        usuariodb.role = body.role;
        usuariodb.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }
            usuarioGuardado.password = ":-)";
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });

});


//========================================
// Crear un nuevo Usuario
//========================================
app.post('/', (req, res, next) => {

    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});

//========================================
// Borrar un Usuario por el ID
//========================================

app.delete('/:id', [ mdAutenticacion.verificaToken, mdAutenticacion.verificaRol ], (req, res) => {

    var id = req.params.id;
    //var body = req.body;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar usuario.",
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `no existe usuario con el id: ${id}`,
                errors: { menssage: "No existe usuario con ese ID" }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });

});








module.exports = app;