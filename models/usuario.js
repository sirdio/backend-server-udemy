var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    mensaje: '{VALUE} no es un rol premitido'
};

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El Nombre es obligatorio'] },
    email: { type: String, unique: true, required: [true, 'El correo es obligatorio'] },
    password: { type: String, required: [true, 'La contraseña es obligatorio'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos }

});

usuarioSchema.plugin(uniqueValidator, { mensaje: 'El {PATH} debe ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);