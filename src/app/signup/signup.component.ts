import { Component, OnInit } from '@angular/core';
import { Signup } from "../model/user";
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

	private signupAttempt:Signup=new Signup();
	private shouldShowMessage=false;
	private message:string;

	constructor(
		private router:Router,
		private userService:UserService
	) { }

	ngOnInit() {
	
	}

	signup(){
		// call the service
		console.debug("Signup a new user");
		this.userService.signup(this.signupAttempt).subscribe((pass:boolean)=>{
			console.debug("moving to homepage");
			this.shouldShowMessage=true;
			this.message="User created ,proceeed to login";
			// this.router.navigate(["/"]);
		},(error:any)=>{
			if(error.status==422){
				if(error._body==2){
					this.shouldShowMessage=true;
					this.message="Email already exists";
				}else if(error._body==3){
					this.shouldShowMessage=true;
					this.message="Weak password";
				}else if(error._body==4){
					this.shouldShowMessage=true;
					this.message="Null password";
				}
			}
			console.debug("error "+error);
		});
	}

}
