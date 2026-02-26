import { supabase } from '@/integrations/supabase/client';

const STORE_URL = 'https://propfirmknowledge.store/';

// Get or create visitor ID for this session
let visitorId: string | null = null;

function getDevice(): string {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet/i.test(ua)) return 'tablet';
  return 'desktop';
}

function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
  };
}

export async function trackVisitor() {
  try {
    const utm = getUTMParams();
    const { data } = await supabase.from('visitors').insert({
      device: getDevice(),
      source: document.referrer || 'direct',
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
    }).select('id').single();

    if (data) {
      visitorId = data.id;
      // Create session
      await supabase.from('sessions').insert({
        visitor_id: visitorId,
        entry_page: window.location.pathname,
      });
    }
  } catch (e) {
    console.error('Tracking error:', e);
  }
}

export async function trackClick(buttonName: string, redirectUrl?: string) {
  try {
    await supabase.from('clicks').insert({
      visitor_id: visitorId,
      button_name: buttonName,
      redirect_url: redirectUrl || STORE_URL,
    });

    // Fire custom events for GA4 / Meta Pixel
    if (typeof window !== 'undefined') {
      // GA4
      if ((window as any).gtag) {
        (window as any).gtag('event', `${buttonName}_Click`, {
          event_category: 'CTA',
          event_label: buttonName,
        });
      }
      // Meta Pixel
      if ((window as any).fbq) {
        (window as any).fbq('trackCustom', `${buttonName}_Click`);
      }
    }
  } catch (e) {
    console.error('Click tracking error:', e);
  }
}

export function trackAndRedirect(buttonName: string, url?: string) {
  const targetUrl = url || STORE_URL;
  trackClick(buttonName, targetUrl);
  window.open(targetUrl, '_blank', 'noopener,noreferrer');
}

export const STORE_LINK = STORE_URL;
