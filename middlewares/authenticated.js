'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secret = "clave-secreta-para-generar-el-token- 9999";

exports.authenticated = function(req,res,nesxt){
    
    //  Comprobar si llega autorizacion 
    if (!req.headers.authorization) {
        return res.status(403).send({
            message: 'La peticion no tiene la cabecera de autorizacion'
        });
    }

    // Limpiar token y quitar comillas 
    const token = req.headers.authorization.replace(/['"]+/g, '')

    try {
        // Decodificar token
        var payload = jwt.decode(token, secret);
        
        // comprobar si el token ha expirado 
        if (payload.exp <= moment().unix()) {
            return res.status(404).send({
                message: 'El token ha expirado'
            });
        }
    } catch (ex) {
        return res.status(404).send({
            message: 'El token no es valido'
        });
    }

    // Adjuntar usuario identificado a request
    req.user = payload;

    // Pasar a la accion


    nesxt();
};