'use strict'
require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const port = process.env.PORT || 3999;

mongoose.set('strictQuery', false);
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('La conexion a la base de datos de mongo se ha realizado correctamente');

        //Crear el servidor 
        app.listen(port, () =>{
            console.log(`El servidor http://localhost/${port} esta funcionando!!!`);
        })
    })
    .catch(error => console.log(error));