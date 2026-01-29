import { Component, OnInit } from '@angular/core';
import { environment } from 'src/enviroments/enviroment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend';
  updateAvailable = false;

  ngOnInit(): void {
    if (environment.production && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then((registration) => {
          registration.onupdatefound = () => {
            const installing = registration.installing;
            if (!installing) {
              return;
            }
            installing.onstatechange = () => {
              if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                this.updateAvailable = true;
              }
            };
          };
        }).catch(() => {
          this.updateAvailable = false;
        });
      });
    }
  }

  reloadApp(): void {
    window.location.reload();
  }
}
