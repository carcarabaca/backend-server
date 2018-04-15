var express = require('express');
var fileUpload = require('express-fileupload');
var app = express();
var fs = require('fs');

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, resp, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return resp
            .status(400)
            .json({
                ok: false,
                mensaje: 'Tipo de coleccion no valida',
                errors: { message: 'Tipo de coleccion no valida' }
            });
    }

    if (!req.files) {
        return resp
            .status(400)
            .json({
                ok: false,
                mensaje: 'No selecciono nada',
                errors: { message: 'Debe de seleccionar una imagen' }
            });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones se aceptan
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return resp
            .status(400)
            .json({
                ok: false,
                mensaje: 'Extension de archivo no valida',
                errors: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
            });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover al archivo del temporal a un path
    var path = `./uploads/${ tipo }/${nombreArchivo}`;
    archivo.mv(path, err => {
        if (err) {
            return resp
                .status(500)
                .json({
                    ok: false,
                    mensaje: 'Error al mover archivo',
                    errors: err
                });
        }

        subirPorTipo(tipo, id, nombreArchivo, resp);
    })
});

function subirPorTipo(tipo, id, nombreArchivo, resp) {
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return resp
                    .status(400)
                    .json({
                        ok: false,
                        mensaje: 'Hospital no existe',
                        errors: { message: 'Hospital no existe' }
                    });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;
            //Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return resp
                    .status(200)
                    .json({
                        ok: true,
                        mensaje: 'Imagen de hospital actulizada',
                        hospital: hospitalActualizado
                    });
            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return resp
                    .status(400)
                    .json({
                        ok: false,
                        mensaje: 'medico no existe',
                        errors: { message: 'Medico no existe' }
                    });
            }

            var pathViejo = './uploads/medicos/' + medico.img;
            //Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return resp
                    .status(200)
                    .json({
                        ok: true,
                        mensaje: 'Imagen de medico actulizada',
                        medico: medicoActualizado
                    });
            });
        });
    }
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return resp
                    .status(400)
                    .json({
                        ok: false,
                        mensaje: 'usuario no existe',
                        errors: { message: 'Usuario no existe' }
                    });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;
            //Si existe, elimina la imagen anterior 
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                return resp
                    .status(200)
                    .json({
                        ok: true,
                        mensaje: 'Imagen de usuario actulizada',
                        usuario: usuarioActualizado
                    });
            });
        });
    }
}

module.exports = app;