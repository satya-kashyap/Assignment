import { Component, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
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

  activeSection = 'cover';
  overallProgress = 0;

  sectionOffsets: { id: string; top: number; height: number }[] = [];
  sectionPositions: number[] = [];
  positionsReady = false;
  showMobileBar = false;

  onToggleBar(isOpen: boolean) {
    this.showMobileBar = isOpen;
  }
  
  ngAfterViewInit() {
    this.waitForImagesThenCalc().then(() => {
      this.calculateSectionOffsets();
      this.updateScrollProgress();
      this.positionsReady = true;
    });

    window.addEventListener('load', () => {
      this.calculateSectionOffsets();
      this.updateScrollProgress();
      this.positionsReady = true;
    });
  }

  async waitForImagesThenCalc(timeout = 800) {
    const container = this.content?.nativeElement;
    if (!container) return;
    const imgs: HTMLImageElement[] = Array.from(container.querySelectorAll('img'));
    if (!imgs.length) {
      await new Promise(r => setTimeout(r, 80));
      return;
    }

    const loaders = imgs.map(img => {
      return new Promise<void>(resolve => {
        if (img.complete) return resolve();
        const onload = () => { clean(); resolve(); };
        const onerr = () => { clean(); resolve(); };
        const clean = () => { img.removeEventListener('load', onload); img.removeEventListener('error', onerr); };
        img.addEventListener('load', onload);
        img.addEventListener('error', onerr);
      });
    });

    await Promise.race([
      Promise.all(loaders),
      new Promise(r => setTimeout(r, timeout))
    ]);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.updateScrollProgress();
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
      const height = rect.height;
      return { id: s.id, top, height };
    });

    const windowHeight = window.innerHeight;
    const totalScrollable = Math.max(document.body.scrollHeight - windowHeight, 1);

    this.sectionPositions = this.sectionOffsets.map(s => {
      const adjustedTop = s.top - windowHeight / 2;

      const pct = (adjustedTop / totalScrollable) * 100;
      return Math.min(100, Math.max(0, pct));
    });
  }

  updateScrollProgress() {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const totalScrollable = Math.max(document.body.scrollHeight - windowHeight, 1);

    for (let i = 0; i < this.sectionOffsets.length; i++) {
      const section = this.sectionOffsets[i];
      const start = section.top;
      const end = section.top + section.height;

      if (
        scrollTop >= start - windowHeight / 2 &&
        scrollTop < end - windowHeight / 2
      ) {
        this.activeSection = section.id;

        const sectionProgress = ((scrollTop - start) / section.height);
        const startPct = this.sectionPositions[i];
        const endPct = this.sectionPositions[i + 1] ?? 100;
        const range = endPct - startPct;

        this.overallProgress = Math.min(100, Math.max(0, startPct + sectionProgress * range));
        break;
      }
    }

    //100% if user is near bottom
    const bottomThreshold = 5;
    if (scrollTop + windowHeight >= document.body.scrollHeight - bottomThreshold) {
      this.overallProgress = 100;
    }
  }

  scrollToSection(id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    window.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
  }
}


