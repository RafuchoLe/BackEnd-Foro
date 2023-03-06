'use strict'

const validator = require('validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const jwt = require('../services/jwt');

let controller = {
    probando: (req, res) => {
        return res.status(200).send({
            message: "Soy el metodo probando"
        });
    },

    testeando: (req, res) => {
        return res.status(200).send({
            message: "Soy el metodo testeando"
        });
    },

    save: (req,res) => {
        // recoger los parametros de la peticion
        const params = req.body;

        try{
            //validar los datos
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (error) {
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }

        if (validate_name && validate_surname && validate_email && validate_password) {
            // crear objeto del usuario
            let user = new User();
    
            // Asignar valores al usuario 
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.role = 'ROLE_USER';
            user.image = null;
    
            // comprobar si el usuario existe
            User.findOne({email: user.email}, (err, issetUser) => {
                if (err) {
                    return res.status(500).send({
                        message: "Error al comprobar duplicidad de usuario"
                    });
                }
                if (!issetUser) {
                    // si no existe
            
                    //cifrar la contraseña
                    bcrypt.hash(params.password,saltRounds, (err, hash) => {
                        user.password = hash;
                        //Guardar usuarios
                        user.save((err, userStored) => {
                            if (err) {
                                return res.status(500).send({
                                    message: "Error al guardar el usuario"
                                });
                            }

                            if (!userStored) {
                                return res.status(400).send({
                                    message: "El usuario no se ha guardado "
                                });
                            }
                            
                            //Devolver respuesta
                            return res.status(200).send({
                                user: userStored,
                                status: 'success'
                            });
                        }); // close save
                    }); // close bcrypt
            
                }else{
                    return res.status(200).send({
                        message: "El usuario ya esta registrado"
                    });
                }
            });
    
            
        }else {
            return res.status(200).send({
            message: "Validacion de los datos del usuario incorrecta, intentalo de nuevo "
        });
        }
    },

    login: (req,res) => {
        // Recoger los parametros de la peticion
        let params = req.body;

        // validar los datos
        try {
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (error) {
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }

        if (!validate_email || !validate_password) {
            return res.status(500).send({
                message: "Datos incorrectos"
            });
        }
        // Buscar usuarios que coincidan con el email
        User.findOne({email: params.email.toLowerCase()}, (err, user) =>{

            if (err) {
                return res.status(500).send({
                    message: "Error al intentar identificarseo",
                    user
                });
            }

            if (!user) {
                return res.status(404).send({
                message: "El usuario no existe",
            });
            }
            // Si lo encuentra,
            // comprobar la contraseña  (coincidencia email y password/bcrypt)
            bcrypt.compare(params.password, user.password, (err, check) =>{

                //Si es correcto
                if (check) {
                    //Generar token de jwt y  devolverlo
                    if (params.gettoken) {
                         // Devolver los datos
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }else{
                        // Limpiar el objeto
                        user.password = undefined;
                
                        // Devolver los datos
                        return res.status(200).send({
                            status: 'success',
                            user
                        });
                    }

                    
                }else{
                    return res.status(200).send({
                        message: "Las credenciales no son correctas"
                    });
                }

            });
    

        });

    },

    update: (req, res) =>{
        // Recoger los datos del usuario
        let params = req.body;

        //validar datos
        
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            
        } catch (error) {
            return res.status(200).send({
                message: "Faltan datos por enviar",
                params
            });
        }

        let userId = req.user.sub;

        // Eliminar propiedades innecesarias
        delete params.password;

        // comprobar si el email es unico
        if (req.user.email != params.email) {
            User.findOne({email: params.email.toLowerCase()}, (err, user) =>{

                if (err) {
                    return res.status(500).send({
                        message: "Error al intentar identificarseo",
                        user
                    });
                }

                if (user && user.email == params.email) {
                    return res.status(200).send({
                    message: "El email no puede ser modificado",
                });
                }else{
                    // Buscar y actualizar documento
                    User.findOneAndUpdate({_id: userId}, params, {new: true}, (err, userUpdated) => {
                        
                        if (err) {
                            return res.status(500).send({
                            status: 'error',
                            user: 'Error al actualizar usuario'
                        });
                        }
            
                        if (!userUpdated) {
                            return res.status(500).send({
                            status: 'error',
                            user: 'No se ha actualizado el usuario'
                        });
                        }
                        
                        return res.status(200).send({
                            status: "success",
                            user: userUpdated
                        });
            
                    });
                }
            });
        }else{
            // Buscar y actualizar documento
            User.findOneAndUpdate({_id: userId}, params, {new: true}, (err, userUpdated) => {
                
                if (err) {
                    return res.status(500).send({
                    status: 'error',
                    user: 'Error al actualizar usuario'
                });
                }
    
                if (!userUpdated) {
                    return res.status(500).send({
                    status: 'error',
                    user: 'No se ha actualizado el usuario'
                });
                }
                
                return res.status(200).send({
                    status: "success",
                    user: userUpdated
                });
    
            });
        }



    },

    uploadAvatar: (req,res) =>{
        // Configurar el modulo multiparty (md) realizado en routes/user.js

        // Recoger el fichero de la peticion
        let file_name = 'Avatar no subido';


        if (req.files.file0 == undefined) {
            //Devolver respuesta
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }
        // Conseguir el nombre y la extencion del archivo subido
        let file_path = req.files.file0.path;
        let file_split = file_path.split('\\');

        // Nombre del archivo
        file_name = file_split[2];

        //extension del archivo
        let ext_split = file_name.split('\.');
        let file_ext = ext_split[1];

        // comprobar extension (solo imagenes), si no es valida borrar  fichero subido
        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif' && file_ext != 'jfif') {
            fs.unlink(file_path, (err)=>{
                return res.status(200).send({
                    status: 'error',
                    message: 'La extension del archivo no es valida'
                });
            });
        }else{
            // Sacar el id del usuario identificado
            let userId = req.user.sub;
    
            // Buscar y actualizar documento  bd
            User.findOneAndUpdate({"_id": userId}, {image: file_name}, {new:true}, (err, userUpdated) =>{
                
                if (err || !userUpdated) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al guardar la imagen'
                    });
                }
                //Devolver respuesta
                return res.status(200).send({
                    status: "success",
                    message: 'Upload Avatar',
                    image: file_name,
                    user: userUpdated
                });
            });
        }
    },

    avatar: (req,res)=>{
        let fileName = req.params.fileName;
        let pathFile = './uploads/users/'+fileName;

        fs.exists(pathFile, (exists) =>{
            if (exists) {
                return res.sendFile(path.resolve(pathFile));
            }else{
                return res.status(404).send({
                    message: 'La imagen no existe'
                });
            }
        });
    },

    getUsers: (req,res)=>{
        User.find().exec((err,users) =>{
            if (err || !users) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay usuarios que mostrar'
                })
            }

            return res.status(200).send({
                status: 'success',
                users
            })
        });
    },

    getUser: (req,res)=>{
        var userId = req.params.userId;

        User.findById(userId).exec((err, user) =>{
            if (err || !user) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe eñ usuario'
                })
            }

            return res.status(200).send({
                status: 'success',
                user
            })
        });
    }
};

module.exports = controller;