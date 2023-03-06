'use strict'
const validator = require('validator')
const Topic = require('../models/topic');


let controller = {
    add: (req, res) => {
        //recoger el id del topic de la url
        let topicId = req.params.topicId;

        // find por id del topic
        Topic.findById(topicId).exec((err, topic) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la peticion '
                });
            }

            if (!topic) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el tema '
                });
            }

            // Comprobar objeto usuario y validar datos
            if (req.body.content) {
                // Validar datos
                try {
                    var validate_content = !validator.isEmpty(req.body.content);
                } catch (err) {
                    return res.status(200).send({
                        message: 'No has comentado nada'
                    });
                }

                if (validate_content) {
                    let comment = {
                        user: req.user.sub,
                        content: req.body.content
                    }
                    // En la propiedad comments del objeto resultante hacer un push
                    topic.comments.push(comment);

                    // Guardar el Topic completo
                    topic.save((err) => {
                        if (err) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al guardar el comentario '
                            });
                        }

                        //Devolver respuesta
                        return res.status(200).send({
                            status: 'success',
                            topic
                        })

                    });

                } else {
                    return res.status(200).send({
                        message: 'No se han validado los datos del comentario'
                    });
                }

            }

        });
    },

    update: (req, res) => {

        //Conseguir el id del comentario que llea de la url 
        let commentId = req.params.commentId;

        // Recoger datos y validar
        let params = req.body;

        try {
            var validate_content = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(200).send({
                message: 'No has comentado nada'
            });
        }

        if (validate_content) {
            // find and update de sub-documento
            Topic.findOneAndUpdate(
                { "comments._id": commentId },
                {
                    "$set": {
                        "comments.$.content": params.content
                    }
                },
                { new: true },
                (err, topicUpdated) => {
                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error en la peticion '
                        });
                    }

                    if (!topicUpdated) {
                        return res.status(404).send({
                            status: 'error',
                            message: 'No existe el tema '
                        });
                    }
                    //Devolver los datos
                    return res.status(200).send({
                        status: 'success',
                        topic: topicUpdated
                    })

                }
            )


        }

    },

    delete: (req, res) => {
        // Sacar el id del topic y del comentario a borrar
        let topicId = req.params.topicId;
        let commentId = req.params.commentId;
        //buscar el topic 
        Topic.findById(topicId, (err, topic) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la peticion '
                });
            }

            if (!topic) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el tema '
                });
            }
            // Seleccionar el subdocumento (comentario)
            var comment = topic.comments.id(commentId);
            // Borrar el comentario
            if (comment) {
                comment.remove();

                // Guardar el topic
                topic.save((err) => {
                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error en la peticion '
                        });
                    }
                    //Devolver resultado
                    return res.status(200).send({
                        status: 'success',
                        topic
                    })
                });
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe comentario '
                });
            }

        });

    }
};

module.exports = controller;