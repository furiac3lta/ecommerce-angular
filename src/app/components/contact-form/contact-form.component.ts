import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.css']
})
export class ContactFormComponent {
  onSubmit() {
    // Lógica para enviar el formulario
    console.log('Formulario enviado');
  }
}
