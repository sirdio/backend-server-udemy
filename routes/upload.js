// Requieres
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

// Inicializar Variables
var app = express();
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');
//middlewares
app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;
    //colecciones válidas
    var coleccionValida = ['medicos', 'usuarios', 'hospitales'];
    if (coleccionValida.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El tipo de colección no es válido.',
            errors: { message: 'Las colecciones válidas son: ' + coleccionValida.join(' - ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No ha selecionado ningún archivo.',
            errors: { message: 'Debe seleccionar un archivo.' }
        });
    }
    //obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //sólo estas extenciones se aceptan
    var extensionesValidas = ['jpg', 'jpeg', 'png', 'gif'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El archivo no es válido.',
            errors: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(' - ') }
        });
    }

    // secrea un nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'El archivo no se pudo subir.',
                errors: err
            });
        }
        subirPorTipp(tipo, id, nombreArchivo, res);
    });


});


function subirPorTipp(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuariodb) => {
            if (!usuariodb) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `El usuario con el id: ${id} no existe`,
                    errors: { menssage: "No existe usuario con ese ID" }
                });
            }
            var pathViejo = `./uploads/usuarios/${ usuariodb.img }`;
            // si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            usuariodb.img = nombreArchivo;
            usuariodb.save((err, usuarioActualizado) => {
                if (err) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen de usuario.',
                        errors: err
                    });
                }
                usuarioActualizado.password = ':-)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizado.',
                    usuario: usuarioActualizado,
                    archivo: nombreArchivo
                });

            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medicodb) => {
            if (!medicodb) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `El medico con el id: ${id} no existe`,
                    errors: { menssage: "No existe medico con ese ID" }
                });
            }
            var pathViejo = `./uploads/medicos/${ medicodb.img }`;
            // si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            medicodb.img = nombreArchivo;
            medicodb.save((err, medicoActualizado) => {
                if (err) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen del medico.',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del medico actualizado.',
                    medico: medicoActualizado
                });

            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospitaldb) => {
            if (!hospitaldb) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `El hospital con el id: ${id} no existe`,
                    errors: { menssage: "No existe hospital con ese ID" }
                });
            }
            var pathViejo = `./uploads/hospitales/${ hospitaldb.img }`;
            // si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            hospitaldb.img = nombreArchivo;
            hospitaldb.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen del hospital.',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del hospital actualizado.',
                    hospital: hospitalActualizado
                });

            });
        });
    }
}

module.exports = app;