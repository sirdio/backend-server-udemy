// Requieres
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
// Inicializar Variables
var app = express();
var Medico = require('../models/medico');

//========================================
// Obtener todos los Medicos 
//========================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({}, ' nombre img usuario hospital').populate('usuario', 'nombre email').populate('hospital', 'nombre')
        .skip(desde)
        .limit(5)
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Medicos',
                        errors: err
                    });
                }
                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                });
            }
        );

});

//========================================
// Obtener un solo Medicos por id
//========================================
app.get('/:id', (req, res, next) => {
	var id = req.params.id;
	Medico.findById(id).populate('usuario', 'nombre img email')
	.populate('hospital')
	.exec( (err, medico)=> {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar médico',
				errors: err
			});
		}
			
		if (!medico) {
			return res.status(400).json({
				ok: false,
			mensaje: `El médico con el id: ${ id } no existe`,
				errors: { message: 'No existe un médico con ese ID' }
			});
		}
		
		res.status(200).json({
			ok: true,
			medico: medico
		});	
	});	
});

//========================================
// Actualizar Medico
//========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medicodb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar medico.",
                errors: err
            });
        }
        if (!medicodb) {
            return res.status(400).json({
                ok: false,
                mensaje: `El medico con el id: ${id} no existe`,
                errors: { menssage: "No existe medico con ese ID" }
            });
        }
        medicodb.nombre = body.nombre;
        medicodb.usuario = req.usuario;
        medicodb.hospital = body.id_hospital
        medicodb.save((err, medicoGuardado) => {
            if (err) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });

});


//========================================
// Crear u nuevo Medico
//========================================
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {

    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario,
        hospital: body.id_hospital
    });
    medico.save((err, medicoGuardado) => {
        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});

//========================================
// Borrar un Medico por el ID
//========================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    //var body = req.body;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar medico.",
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `no existe medico con el id: ${id}`,
                errors: { menssage: "No existe medico con ese ID" }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });

});








module.exports = app;