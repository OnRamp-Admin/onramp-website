import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://getonramp.io';
const DEFAULT_TITLE = 'OnRamp | Voice-First AI for Automotive Technicians';
const DEFAULT_DESCRIPTION =
  'ONRAMP is the hands-free AI voice agent for automotive technicians. Get step-by-step repair guidance, automatic documentation, and voice-controlled workflow — no screen, no terminal, no interruptions.';

interface SEOOptions {
  title: string;
  description: string;
  noindex?: boolean;
  ogImage?: string;
}

function setMetaTag(property: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setRobotsMeta(noindex: boolean) {
  let el = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
  if (noindex) {
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', 'robots');
      document.head.appendChild(el);
    }
    el.setAttribute('content', 'noindex, nofollow');
  } else if (el) {
    el.remove();
  }
}

export function useSEO({ title, description, noindex = false, ogImage }: SEOOptions) {
  const { pathname } = useLocation();
  const canonicalUrl = `${SITE_URL}${pathname}`;
  const image = ogImage || `${SITE_URL}/og-image.png`;

  useEffect(() => {
    document.title = title;
    setMetaTag('description', description);
    setCanonical(canonicalUrl);
    setRobotsMeta(noindex);

    // Open Graph
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:image', image, true);

    // Twitter
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', image);

    return () => {
      document.title = DEFAULT_TITLE;
      setMetaTag('description', DEFAULT_DESCRIPTION);
      setCanonical(SITE_URL + '/');
      setRobotsMeta(false);
      setMetaTag('og:title', DEFAULT_TITLE, true);
      setMetaTag('og:description', DEFAULT_DESCRIPTION, true);
      setMetaTag('og:url', SITE_URL + '/', true);
      setMetaTag('og:image', `${SITE_URL}/og-image.png`, true);
      setMetaTag('twitter:title', DEFAULT_TITLE);
      setMetaTag('twitter:description', DEFAULT_DESCRIPTION);
      setMetaTag('twitter:image', `${SITE_URL}/og-image.png`);
    };
  }, [title, description, canonicalUrl, noindex, image]);
}
