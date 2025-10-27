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

  showMobileBar = false;
  @Output() toggleBar = new EventEmitter<boolean>();

  toggleMobileBar() {
    this.showMobileBar = !this.showMobileBar;
    this.toggleBar.emit(this.showMobileBar);
  }

  // for mobile touch dragging...
  private isDragging = false;
  private barHeight = 0;
  private startY = 0;

  onTouchStart(event: TouchEvent) {
    if (window.innerWidth >= 768) return;
    this.isDragging = true;
    this.barHeight = (event.target as HTMLElement).clientHeight;
    this.startY = event.touches[0].clientY;
    event.preventDefault();
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
    const touchY = event.touches[0].clientY - this.startY;
    const scrollHeight = document.body.scrollHeight - window.innerHeight;
    const newScroll = (touchY / this.barHeight) * scrollHeight;
    window.scrollTo({ top: Math.min(scrollHeight, Math.max(0, newScroll)), behavior: 'auto' });
  }

  onTouchEnd() {
    this.isDragging = false;
  }


}
