import {ServerApp} from './server-app';
// import ServerApp;

import winston=require('winston');
require('dotenv').config();
winston.level='debug';

winston.info("Initializing Server");

//start the server (the db field of the server will be empty)
winston.info("Starting server without a database");
let server=new ServerApp();
server.setRoutes();
server.start();

