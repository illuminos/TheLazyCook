import { Injectable } from '@angular/core';
import { Http,Headers,RequestOptions,Response } from '@angular/http';
import { LoginAttempt,Signup } from './model/user';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class UserService {

   constructor(
	  private http:Http
  ) { }

	login(attempt:LoginAttempt):Observable<boolean>{
		console.debug("posting to server");
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options=new RequestOptions({headers:headers});
		return this.http.post("/api/authenticate-user",JSON.stringify(attempt),options).map((res:Response)=>{return res.json()});
	}

	signup(signup:Signup):Observable<boolean>{
		console.debug("posting signup to server");
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options=new RequestOptions({headers:headers});
		return this.http.post("/api/create-user",JSON.stringify(signup),options).map((res:Response)=>{return res.json()});
	}

}
