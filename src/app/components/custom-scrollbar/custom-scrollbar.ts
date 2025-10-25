import { Component, Input, Output, EventEmitter, HostListener, input } from '@angular/core';
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
  @Input() progressSegments: number[] = [];
  @Output() navigate = new EventEmitter<string>();
  @Input() overallProgress = 0;
  @Input() scrollposition = 0;
  @Input() sectionPositions: number[] = [];
  scrollTimeout: any;
  isHovered = false;
  hasScrolled = false;

  @HostListener('window:scroll')
  onScroll() {
    this.hasScrolled = true;
  }

  getActiveLabel(): string {
    const active = this.sections.find(s => s.id === this.activeSection);
    return active?.label || '';
  }


}
