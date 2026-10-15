import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Pollution } from '../../models/pollution';

@Component({
  imports: [DatePipe, DecimalPipe],
  selector: 'app-recap-declaration',
  styleUrl: './recap-declaration.scss',
  templateUrl: './recap-declaration.html',
})
export class RecapDeclaration {
  @Input({required:true}) declarationPollution: Pollution={
    titre: '',
    type: '',
    description: '',
    dateObservation: '',
    lieu: '',
    latitude: 0,
    longitude: 0
  };
  @Output() backToForm = new EventEmitter<void>();

  photoIndisponible = false;

  get lienCarte(): string {
    const { latitude, longitude } = this.declarationPollution;
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;
  }

  goBackToForm(){
    this.backToForm.emit();
  }


}
