// Requieres
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Inicializar Variables
var app = express();
var Usuario = require('../models/usuario');
// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


//========================================
// login google
//========================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}


app.post('/google', async(req, res, next) => {
    var token = req.body.token;
    var googleUser = await verify(token).catch((err) => {
        res.status(403).json({
            ok: false,
            errors: 'Token no válido.'
        });
    });
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario.",
                errors: err
            });
        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe usar su autenticación normal."
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id,
					menu: obtenerMenu( usuarioDB.role ),
                    mensaje: "login POST correcto."
                });
            }
        } else {
            // El usuario no existe....Hay que crearlo.
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.password = '*:-)*';
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al crear usuario',
                        errors: err
                    });
                }
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id,
					menu: obtenerMenu( usuarioDB.role ),
                    mensaje: "login POST correcto."
                });
            });
        }

    });


    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'peticion realizada con exito.',
    //     googleUser: googleUser
    // });

});

//========================================
// Metodo Login
//========================================
app.post('/', (req, res, next) => {
    var body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuarios.",
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: "Crednecial incorrecta - email",
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Crednecial incorrecta - password",
                errors: err
            });
        }
        // Crear ToKen
        usuarioDB.password = ":)";
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 horas


        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id,
			menu: obtenerMenu( usuarioDB.role ),
            mensaje: "login POST correcto."
        });
    });


});




function obtenerMenu( ROLE ) {
	
	var menu = [
		{
			titulo:"Principal",
			icono:"mdi mdi-gauge",
			submenu:[
				{ titulo:"Dashoard", url:"/dashboard" },
				{ titulo:"ProgressBar", url:"/progress" },
				{ titulo:"Graficas", url:"/graficas1" },
				{ titulo:"Promesas", url:"/promesas"  },
				{ titulo:"Reactiv-js", url:"/rxjs"  },
			]
		},
		{
			titulo:"Mantenimientos",
			icono: "mdi mdi-account-settings-variant",//"mdi mdi-folder-lock-open",
			submenu:[
				//{ titulo:"Usuarios", url:"/usuarios" },
				{ titulo:"Hospitales", url:"/hospitales" },
				{ titulo:"Médicos", url:"/medicos" }
			]
		}
	];
		
	if ( ROLE === 'ADMIN_ROLE' ) {
		menu[1].submenu.unshift( { titulo:"Usuarios", url:"/usuarios" } );
	}
	return menu;
}



















module.exports = app;