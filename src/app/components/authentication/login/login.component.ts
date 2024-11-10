import { Component, OnInit } from '@angular/core';
import { Userdto } from 'src/app/common/userdto';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username:string='';
  password:string='';


  ngOnInit(): void {
   
  }
  constructor(private authentication:AuthenticationService){

  }
  login(){
    let userDto = new Userdto(this.username, this.password);
    this.authentication.login(userDto).subscribe(
      token =>console.log(token)
    )
    console.log(userDto);

  }
}
