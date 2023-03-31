'use strict'

// Requires
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Ejecutar express
const app = express();

// Cargar archivos de ruta

const user_routes = require('./routes/user');
const topic_routes = require('./routes/topic');
const comment_routes = require('./routes/comment');

//Configuracion de cors
app.use(cors());

// Middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// Reescribir rutas

app.use('/api', user_routes);
app.use('/api', topic_routes);
app.use('/api', comment_routes);

// Exportar Modulo
module.exports = app;