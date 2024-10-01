import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AlertService } from '@core/index';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  public form!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  async onSubmit() {
    if (this.form.valid) {
      let response = await this.authService.signup(this.form.value);
      if (response?.accessToken) {
        this.alertService.showAlert(1, 'Success', 'Welcome ' + response.userName + '!');
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('userName', JSON.stringify(response.userName));
        this.router.navigate(['/pages/home']);
      } else {
        this.alertService.showAlert(2, 'Error', 'Credentials are not valid');
      }
    }
  }
}
