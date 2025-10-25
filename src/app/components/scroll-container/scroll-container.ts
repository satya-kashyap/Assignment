import {
  Component, ElementRef, ViewChild, AfterViewInit, HostListener, NgZone,
  Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomScrollbar } from '../custom-scrollbar/custom-scrollbar';
import { Cover } from '../sections/cover/cover';
import { Intro } from '../sections/intro/intro';
import { Preface } from '../sections/preface/preface';
import { Timeline } from '../sections/timeline/timeline';
import { Outro } from '../sections/outro/outro';

@Component({
  selector: 'app-scroll-container',
  standalone: true,
  imports: [CommonModule, CustomScrollbar, Cover, Intro, Preface, Timeline, Outro],
  templateUrl: './scroll-container.html',
  styleUrls: ['./scroll-container.css']
})
export class ScrollContainer implements AfterViewInit {
  @ViewChild('content') content!: ElementRef<HTMLDivElement>;

  sections = [
    { id: 'cover', label: '' },
    { id: 'intro', label: 'Intro' },
    { id: 'preface', label: 'Preface' },
    { id: 'events', label: 'Events' },
    { id: 'credits', label: 'Credits' }
  ];
  overallProgress = 0;
  activeSection = 'cover';
  segmentProgress: number[] = [];
  sectionOffsets: { id: string; top: number; height: number }[] = [];

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.calculateSectionOffsets();
      this.updateScrollProgress();
    }, 500);

    window.addEventListener('load', () => {
      this.calculateSectionOffsets();
      this.updateScrollProgress();
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.ngZone.run(() => this.updateScrollProgress());
  }

  @HostListener('window:resize')
  onResize() {
    this.calculateSectionOffsets();
    this.updateScrollProgress();
  }

  calculateSectionOffsets() {
    this.sectionOffsets = this.sections.map(s => {
      const el = document.getElementById(s.id);
      if (!el) return { id: s.id, top: 0, height: 0 };
      const rect = el.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      return { id: s.id, top, height: rect.height };
    });
  }

  // updateScrollProgress() {
  //   const scrollTop = window.scrollY;

  //   this.segmentProgress = this.sectionOffsets.map(section => {
  //     const start = section.top;
  //     const end = section.top + section.height;
  //     if (scrollTop < start) return 0;
  //     if (scrollTop > end) return 100;
  //     return ((scrollTop - start) / section.height) * 100;
  //   });

  //   for (const section of this.sectionOffsets) {
  //     if (scrollTop >= section.top - 300 && scrollTop < section.top + section.height - 300) {
  //       this.activeSection = section.id;
  //       break;
  //     }
  //   }
  // }

updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;

  // ✅ Ensure the bar fully fills at the very bottom
  this.overallProgress = Math.min((scrollTop / docHeight) * 100, 100);

  // ✅ Optional smoothing for nicer transition at section ends
  if (scrollTop + window.innerHeight >= document.body.scrollHeight - 5) {
    this.overallProgress = 100;
  }

  // Update segment-wise progress for section fills
  this.segmentProgress = this.sectionOffsets.map(section => {
    const start = section.top;
    const end = section.top + section.height;
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 100;
    return ((scrollTop - start) / section.height) * 100;
  });

  // Active section tracking
  for (const section of this.sectionOffsets) {
    if (scrollTop >= section.top - 300 && scrollTop < section.top + section.height - 300) {
      this.activeSection = section.id;
      break;
    }
  }
}


  scrollToSection(id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    const top = target.offsetTop;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}
