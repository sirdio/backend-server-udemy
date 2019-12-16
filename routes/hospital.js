// Requieres
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
// Inicializar Variables
var app = express();

var Hospital = require('../models/hospital');

//========================================
// Obtener todos los Hospitales (5)
//========================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({}, ' nombre img usuario ').populate('usuario', 'nombre email')
        .skip(desde)
        .limit(5)
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }
                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });
            }
        );

});

//========================================
// Obtener todos los Hospitales
//========================================
app.get('/todos', (req, res, next) => {
    Hospital.find({}, ' nombre img usuario ').populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }
                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });
            }
        );

});

//========================================
// Obtener Hospital por id  
//========================================
app.get('/:id', (req, res, next) => {
	var id = req.params.id;
	Hospital.findById(id).populate('usuario', 'nombre img email').exec( (err, hospital)=> {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar hospital',
				errors: err
			});
		}
			
		if (!hospital) {
			return res.status(400).json({
				ok: false,
			mensaje: `El hospital con el id: ${ id } no existe`,
				errors: { message: 'No existe un hospital con ese ID' }
			});
		}
		
		res.status(200).json({
			ok: true,
			hospital: hospital
		});	
	});	
});

//========================================
// Actualizar Hospital
//========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospitaldb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar hospital.",
                errors: err
            });
        }
        if (!hospitaldb) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id: ${ id } no existe`,
                errors: { menssage: "No existe hospital con ese ID" }
            });
        }
        hospitaldb.nombre = body.nombre;
        hospitaldb.usuario = req.usuario;
        hospitaldb.save((err, hospitalGuardado) => {
            if (err) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });

});


//========================================
// Crear u nuevo Hospital
//========================================
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario
    });
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

//========================================
// Borrar un Hospital por el ID
//========================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    //var body = req.body;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar hospital.",
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `no existe hospital con el id: ${id}`,
                errors: { menssage: "No existe hospital con ese ID" }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });

});








module.exports = app;