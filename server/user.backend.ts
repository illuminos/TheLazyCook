import ojs= require('orientjs');
import winston=require('winston');
import Promise=require('bluebird');
import { FileSystemBackend } from './filesystem.backend';

// TODO remove file system dependency

export class UserBackend{

	constructor(private db:ojs.Db,private fileSystemBackend:FileSystemBackend){
	}

	checkAndCreateNewUser(user:any):Promise<number>{
		return this.db.select().from('User').where({
			email: user.email
		}).all().then((records:any[])=>{
			if(records.length>0){
				return 2;//Email already taken
			}else{
				return this.fileSystemBackend.createFilesystem().
				then((r:ojs.Record)=>{
					return this.insertNewUser(user,r);
				})
			}
		}).catch((error:Error)=>{
			winston.error("Users retrieval : "+error.message);
			return 1;//InternalServerError
		})
	}

	private insertNewUser(user:any,fileSystem:any):Promise<number>{
 		return this.db.insert().into('User').set({
			firstName:user.firstName,
			lastName:user.lastName,
			email:user.email,
			password:user.password,
			gender:user.gender==undefined?'undisclosed':user.gender,
			dateOfBirth:user.dateOfBirth,
			fileSystem:fileSystem['@rid']
		}).one().then(()=>{
			return 0;//success
		}).catch((error:Error)=>{
			winston.error("New user insertion: "+error.message);
			return 1;
		})
	}

	authenticateUser(user:any):Promise<AuthenticationResult>{
 		return this.db.select().from('User').where({
			email: user.email,
			password:user.password
		}).all().then((records:any[])=>{
			if(records.length>0){
				let authenticated=new AuthenticationResult(0);
				authenticated.user=records[0];
				return authenticated;
			}else{
				return new AuthenticationResult(3);
			}
		}).catch((error:Error)=>{
			winston.error("Users login fail : "+error.message);
			return new AuthenticationResult(1);
		})
	}
}


/** 
 * Result of the authentication request :
 * 0:success,
 * 1=InternalServerError,
 * 2=Email does not exist,
 * 3=InvalidUsernameOrPassword
*/
export class AuthenticationResult{
	/** If Successful, the resulting user model is stored in the user field */
	attempt:number;
	private _user:[any];

	constructor(attempt:number){
		this.attempt=attempt;
	}

	/** On setting the user property, confidential and heavy stuff gets removed. */
	set user(user:any){
		delete user.password;
		this._user=user;
	}

	/** User model received from the backend after taking away all the confidential(like password) and heavy stuff etc. */
	get user():any{
		return this._user;
	}
}

export function statusCodeForLogin(attempt:number):number{

	switch(attempt){
		case 0:return 200;//success
		case 1:return 500;//InternalServerError
		case 2:return 422;//Email does not exist
		case 3:return 401;//InvalidUsernameOrPassword	
		default:return 200;
	}
}

export function statusCodeForSignup(attempt:number):number{
	switch(attempt){
		case 0:return 200;//success
		case 1:return 500;//InternalServerError
		case 2:return 422;//Email already in use
		case 3:return 422;//weak password
		case 4:return 422;//null password

		default:return 200;
	}
}