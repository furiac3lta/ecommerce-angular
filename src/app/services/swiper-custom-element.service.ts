import { Injectable } from '@angular/core';
import { register } from 'swiper/element/bundle';

@Injectable({
  providedIn: 'root'
})
export class SwiperCustomElementService {

  constructor() {
    register();
  }
}
