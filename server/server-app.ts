import express = require('express');
import http = require('http');
import https = require('https');
import path = require('path');
import orientjs = require('orientjs');
import winston = require('winston');
import bodyParser = require('body-parser');
import session = require('express-session');
import { UserBackend } from './user.backend';
import { SchemaBackend } from './schema.backend';
import { AuthenticationResult,statusCodeForLogin,statusCodeForSignup } from './user.backend';
import * as multer from 'multer';
const uploader=multer({dest: "./uploads/"}).any();

export class ServerApp{

	private app: express.Application;
	private db:orientjs.Db;
	private userBackend:UserBackend;
	private developerFeatures:SchemaBackend;

	constructor() {
		this.app = express();
	}

	// constructor(db?:orientjs.Db) {
	// 	this.app = express();
	// 	this.db=db;
	// }

	setRoutes():void {
		
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({
			extended:false
		}));

		//TODO WARNING: the secret should not be stored in code.(Dev purposes only)
		//TODO Replace with mongo connect or redis store, in memory is not suitable for production
		this.app.use(session({secret:"sdf923jk23asf01gasds42",saveUninitialized:true,resave:false}));

		//setup file uploads using multer
		this.app.use(uploader);
		this.configureAPIRoutes();
		
		//static resources (is amongst the main folders in the root of the project)
		this.app.use('/', express.static(path.join(__dirname, '../', 'dist')));//for one level

		//all other routes are handled by angular
		this.app.get('/*', this.homePage);//this should be in the end

	}

	private configureAPIRoutes(){

		// delete all db records(developer feature)
		//TODO WARNING: remove on production
		this.app.delete('/dev/delete-db-records', (req:express.Request, res:express.Response) =>{
			winston.warn("Developer feature: destroying all records in the database!!!");
			(<any>req).session.destroy();
			this.developerFeatures.deleteDatabaseRecords().
			then((attempt:number)=>{
				jsonHeader(res).status(200).send(JSON.stringify({result:"All DB records destroyed!"}));
			});
		});

		// Drop entire database scheme (developer feature)
		//TODO WARNING: remove on production
		this.app.delete('/dev/drop-db', (req:express.Request, res:express.Response) =>{
			winston.warn("Developer feature: dropping the entire database schema!!!");
			(<any>req).session.destroy();
			this.developerFeatures.dropDatabaseSchema().
			then((attempt:number)=>{
				jsonHeader(res).status(200).send(JSON.stringify({result:"DB Schema Dropped!"}));
			});
		});

		// Ensure database schema and creates it if needed, prefers creating from scratch (developer feature)
		//TODO WARNING: remove on production
		this.app.post('/dev/ensure-db-schema', (req:express.Request, res:express.Response) =>{
			winston.warn("Developer feature: Ensuring database schema, creating tables if needed");
			(<any>req).session.destroy();
			this.developerFeatures.ensureDatabaseSchema().
			then((attempt:any)=>{
				jsonHeader(res).status(200).send(JSON.stringify({result:"DB Schema Ensured"}));
			});
		});

		this.app.post('/api/sample-upload', (req:express.Request, res:express.Response) =>{
			uploader(req,res,(error:Error)=>{
				winston.debug("got a file here ");
				if(error){
					console.error("Error occured while uploading file");
				}
				res.send("File is uploaded");
			});

		});

		//rough work
		this.app.get('/api/sample-json', (req:express.Request, res:express.Response) => {
            winston.debug("Rough work for development purposes");
            //Do rough work in this end point
			let obj={
				first:"hello",
				second:"world"
			}
			res.send(JSON.stringify(obj));
			
			//--------------------------------
		});

		//login authentication
		this.app.post('/api/authenticate-user', (req:express.Request, res:express.Response) => {
			winston.debug("Attempting to login user");
			this.userBackend.authenticateUser((<any>req).body).
			then((result:AuthenticationResult)=>{
				//if authentic, store the user model in the session
				if(result.attempt==0){
					(<any>req).session.user=result.user;
					winston.debug("setting user in session(without the password)");
				}
				//respond back with an appropriate status code
				jsonHeader(res).status(statusCodeForLogin(result.attempt)).send(JSON.stringify(result.attempt));
			});
		});

		//create a user
		this.app.post('/api/create-user', (req:express.Request, res:express.Response) => {
			winston.debug("Attempting to create new user");
			this.userBackend.checkAndCreateNewUser((<any>req).body).
			then((attempt:number)=>{
				//respond back with an appropriate status code
				jsonHeader(res).status(statusCodeForSignup(attempt)).send(JSON.stringify(attempt));
			});
		})

		//logout user
		this.app.post('/api/logout', (req:express.Request, res:express.Response) => {
			winston.debug("Clearing user out of session: logout user");
			let loggedInUser=(<any>req).session.user;
			if(!loggedInUser){
				res.status(500).send("User already not in session");
			}else{
				(<any>req).session.destroy();
				res.send(JSON.stringify(0));
			}
		});

	}

	start():void {
		//normalize ports by environment variables        
		let port=process.env.PORT_SANITY||3000;
	
		// http.createServer(express).listen(port);
		this.app.listen(port,()=>{
			winston.info("Server started on port "+port);
		})
	}

	private homePage(req: express.Request, res: express.Response) {

		let pathToIndexPage:string;
		pathToIndexPage=path.join(__dirname,'../','src/','index.html'); //amongst the main folders
		winston.log('info',"Server refreshed index file: "+pathToIndexPage);
        res.sendFile(pathToIndexPage);
    }
}


/**
 * Simple method that set the content header to be json. 
 * Returns the same response to allow chaining. 
 */
export function jsonHeader(response:express.Response):express.Response{
	response.setHeader('Content-Type', 'application/json');
	return response;
}