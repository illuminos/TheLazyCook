import { Component, OnInit } from '@angular/core';
import { LoginAttempt } from '../model/user';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	private shouldShowMessage=false;
	private message:string;
	private attempt:LoginAttempt=new LoginAttempt();

	constructor(
		private router:Router,
		private userService:UserService
	) { }

	ngOnInit() {
		this.message="Will show a message here";
	}

	login(){
		console.debug("attempting to login");

		this.userService.login(this.attempt).subscribe((pass:boolean)=>{
			this.router.navigate(["/home"]);
			this.shouldShowMessage=true;
			this.message="Please wait";
			console.log("User authenticatedd");
		},(error:any)=>{
			if(error.status==401 && error._body==3){
				this.message="Invalid username or password";
				this.shouldShowMessage=true;
			}else{
				this.message="Something went wrong";
				this.shouldShowMessage=true;
				console.debug("error "+error);
			}
		})

	}

}
