// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// @Component({
//   selector: 'app-preface',
//   imports: [CommonModule],
//   templateUrl: './preface.html',
//   styleUrl: './preface.css',
// })
// export class Preface {

// }

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preface',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preface.html',
  styleUrls: ['./preface.css']
})
export class Preface {}
