import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-scrollbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-scrollbar.html',
  styleUrls: ['./custom-scrollbar.css']
})
export class CustomScrollbar {
  @Input() sections: { id: string; label: string }[] = [];
  @Input() activeSection = '';
  @Input() progressSegments: number[] = []; // array of per-section percentages
  @Output() navigate = new EventEmitter<string>();
  @Input() overallProgress = 0;
}
