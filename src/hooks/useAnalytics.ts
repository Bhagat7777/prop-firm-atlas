import { useEffect } from 'react';

// GA4 + Meta Pixel initialization
export function useAnalytics(ga4Id?: string, metaPixelId?: string) {
  useEffect(() => {
    // Google Analytics 4
    if (ga4Id) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
      document.head.appendChild(script);

      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;
      gtag('js', new Date());
      gtag('config', ga4Id);
    }

    // Meta Pixel
    if (metaPixelId) {
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = true;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      (window as any).fbq('init', metaPixelId);
      (window as any).fbq('track', 'PageView');
    }
  }, [ga4Id, metaPixelId]);
}
