import { NgModule, CUSTOM_ELEMENTS_SCHEMA }      from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
		{ path: '',  component: LoginComponent},
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}//	  { path: 'home',  component: HomeComponent }