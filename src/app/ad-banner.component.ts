import { ChangeDetectionStrategy, Component, Input, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface WindowWithAdSense extends Window {
  adsbygoogle?: Record<string, unknown>[];
}

@Component({
  selector: 'app-ad-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center justify-center w-full h-full' },
  template: `
    <!-- Standard 300x250 Mobile Rectangle Ad -->
    <ins class="adsbygoogle"
         style="display:inline-block;width:300px;height:250px"
         [attr.data-ad-client]="client"
         [attr.data-ad-slot]="slot"></ins>
  `
})
export class AdBannerComponent implements AfterViewInit {
  @Input() client = 'ca-pub-0000000000000000'; // Your Publisher ID
  @Input() slot = '0000000000'; // Your Ad Unit ID

  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit() {
    // Only execute the Google script if running in the user's actual browser
    if (isPlatformBrowser(this.platformId)) {
      try {
        const win = window as WindowWithAdSense;
        win.adsbygoogle = win.adsbygoogle || [];
        win.adsbygoogle.push({});
      } catch (e) {
        console.error('AdSense push error:', e);
      }
    }
  }
}