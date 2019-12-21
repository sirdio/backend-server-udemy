// Requieres
var jwt = require('jsonwebtoken');

// Inicializar Variables

var SEED = require('../config/config').SEED;



//========================================
// Verificar ToKen "Middleware"
//========================================

exports.verificaToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: " Token incorrecto ",
                errors: err
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
};

//========================================
// Verificar Rol "Middleware"
//========================================

exports.verificaRol = function(req, res, next) {
    var usuario = req.usuario;
	if( usuario.role === 'ADMIN_ROLE' ) { 
		next();
		return;
	}else{
		return res.status(401).json({
               ok: false,
               mensaje: " Acceso Denegado ",
               errors: { message: 'Acceso Denegado, no tiene permitido acceder a la función seleccionada' }
        });	
	}
};

//========================================
// Verificar Rol o mismo usuario "Middleware"
//========================================

exports.verificaRolMismoUsuario = function(req, res, next) {
    var usuario = req.usuario;
	var id = req.params.id;
	if( usuario.role === 'ADMIN_ROLE' || usuario._id === id ) { 
		next();
		return;
	}else{
		return res.status(401).json({
               ok: false,
               mensaje: " Acceso Denegado ",
               errors: { message: 'Acceso Denegado, no tiene permitido acceder a la función seleccionada' }
        });	
	}
};