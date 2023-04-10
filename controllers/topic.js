'use strict'

const validator = require('validator');
const Topic = require('../models/topic');

let controller = {
    test : (req, res) =>{
        return res.status(200).send({
            message: 'Hola desde topic'
        });
    },

    save: (req,res) =>{
        //Recoger los parametros por post
        let params = req.body;

        // Validar datos
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        }catch(err){
            return res.status(200).send({
                message: 'Faltan datos por enviar '
            });
        }
        if (validate_content && validate_title && validate_lang) {
            // Crear objeto a guardar
            let topic = new Topic();
    
            //asignar valores
            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            topic.user = req.user.sub;
    
            // Guardar topic 
            topic.save((err,topicStored) => {
                if (err || !topicStored) {
                    return res.status(404).send({
                        statur: 'error',
                        message: 'El tema no se ha podido guardar'
                    });
                }

                //Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    topic: topicStored
                });

            });
    
        }else{
            return res.status(200).send({
                message: 'Los datos no son validos'
            });
        }
            
    },

    getTopics: (req,res) =>{
        //Cargar la libreria de paginacion en la clase (MODELO )

        // Recoger la pagina actual
        if (!req.params.page || req.params.page == 0 || req.params.page == "0"  || req.params.page == null || req.params.page == undefined) {
            var page = 1;
        }else{
            var page = parseInt(req.params.page);
        }

        // Indicar las opciones de paginacion
        const options = {
            sort: { date: -1 },
            populate: 'user',
            limit: 5,
            page: page
        }

        //Find paginado
        Topic.paginate({},options, (err,topics)=>{
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al hacer consulta'
                });
            }

            if (!topics) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay topics'
                });
            }
            // Devolver resultado (topic, total de topic, total de paginas)
            return res.status(200).send({
                status: 'success',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages
            });

        }) 

    },

    getTopicsByUser: (req,res) => {
        //Conseguir el id del usuario
        let userId = req.params.user;

        // Find con la condicion de usuario
        Topic.find({
            user: userId
        })
        .sort([['date', 'descending']])
        .exec((err, topics) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error em la peticion'
                });
            }

            if (!topics) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay temas para mostrar;'
                });
            }

            // Devolver un resultados
            return res.status(200).send({
                status: 'success',
                topics
            });
        })
    },

    getTopic: (req,res) =>{
        //sACAR EL ID DEL TOPIC DE LA URL
        let topicId = req.params.id;

        // fIND POR ID DEL TOPIC
        Topic.findById(topicId)
        .populate('user')
        .populate('comments.user')
        .exec((err,topic) =>{
            if (err) {
                return res.status(500).send({
                    status : 'error',
                    message: 'Error en la peticion'
                });
            }

            if (!topic) {
                return res.status(404).send({
                    status : 'error',
                    message: 'No existe el topic'
                });
            }
            //dEVOLCER RESULTADO
            return res.status(200).send({
                status: 'success',
                topic
            });

        })

    },

    update: (req,res) => {
        //Recoger el id del topic de la url
        let topicId = req.params.id;

        // Recoger los datos que llegarondesde post
        let params = req.body;

        // Validar datos
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);

        }catch(err){
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }
        if (validate_title && validate_content && validate_lang) {
            // Montar un json con los datos modificables
            let update = {
                title: params.title,
                content: params.content,
                code: params.code,
                lang: params.lang
            };
    
            // Find and update del topic por id y por id del usuario
           
            Topic.findOneAndUpdate({_id: topicId, user: req.user.sub}, update, {new:true}, (err, topicUpdated) =>{
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la peticion'
                    });
                }
                if (!topicUpdated) {
                    return res.status(400).send({
                        status:'error',
                        message: 'Error en la actualizacion del tema'
    
                    });
                }
                //Devolver respuesta
                return res.status(200).send({
                    message: 'success',
                    topic: topicUpdated
                });
            });
    
        }else{
            return res.status(200).send({
                message: 'La validacion de los datos  no es correcta'
            });
        }
    },

    delete: (req,res) =>{
        // Sacar el id del topic de la URL
        let topicId = req.params.id;

        // find and delte por topicID y por userID
        Topic.findOneAndDelete({_id: topicId, user: req.user.sub}, (err,topicRemoved) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la peticion'
                });
            }

            if (!topicRemoved) {
                return res.status(400).send({
                    status:'error',
                    message: 'Error no se ha borrado el tema'

                });
            }
            
            //Devolver respuesta
            return res.status(200).send({
                status: 'Success',
                topic: topicRemoved
            })
        })
    },

    search: (req,res) => {

        //Sacar el string a buscar de la url
        var searchString = req.params.search

        //find or
        Topic.find({"$or":[
            { "title": {"$regex": searchString, "$options": "i"} },
            { "content": {"$regex": searchString, "$options": "i"} },
            { "code": {"$regex": searchString, "$options": "i"} },
            { "lang": {"$regex": searchString, "$options": "i"} }
        ]})
        .populate('user')
        .sort([['date', 'descending']])
        .exec((err, topics) =>{
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la peticion'
                });
            }

            if (!topics) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay temas disponibles'
                });
            }
            //Devolver el resultado
            return res.status(200).send({
                status: 'success',
                topics
            });
        });
    }
};

module.exports = controller;