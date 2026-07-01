import { defineConfig } from 'vitepress';

const hostname = 'https://itsiurisilva.github.io/sDeck/';
const ogImage = `${hostname}stream_deck.png`;

export default defineConfig({
  base: '/sDeck/',
  title: 'sDeck',
  description: 'Free, self-hosted Stream Deck alternative for OBS, Spotify, and Twitch — control your stream from any phone or tablet on your Wi-Fi.',
  lang: 'en-US',
  sitemap: {
    hostname
  },
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', href: '/sDeck/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#8b5cf6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'sDeck' }],
    ['meta', { property: 'og:title', content: 'sDeck — Free, Self-Hosted Stream Deck Alternative' }],
    ['meta', { property: 'og:description', content: 'Control OBS, Spotify, Twitch, and your PC from any device on your Wi-Fi network — no specialized hardware, no cloud, no subscription.' }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:url', content: hostname }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'sDeck — Free, Self-Hosted Stream Deck Alternative' }],
    ['meta', { name: 'twitter:description', content: 'Control OBS, Spotify, Twitch, and your PC from any device on your Wi-Fi network — no specialized hardware, no cloud, no subscription.' }],
    ['meta', { name: 'twitter:image', content: ogImage }],
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'sDeck',
        operatingSystem: 'Windows, macOS, Linux',
        applicationCategory: 'MultimediaApplication',
        description: 'Free, self-hosted Stream Deck alternative that controls OBS Studio, Spotify, Twitch chat/moderation, and your PC from any device on your Wi-Fi network.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        license: 'https://opensource.org/licenses/MIT',
        url: hostname,
        image: ogImage,
        sameAs: ['https://github.com/itsiurisilva/sDeck']
      })
    ]
  ],

  themeConfig: {
    logo: '/sdeck-icon-128.png',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'GitHub', link: 'https://github.com/itsiurisilva/sDeck' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Configuration', link: '/guide/configuration' },
          { text: 'Actions & Widgets', link: '/guide/actions-widgets' },
          { text: 'Integrations', link: '/guide/integrations' },
          { text: 'Stream Overlays', link: '/guide/overlays' },
          { text: 'Troubleshooting', link: '/guide/troubleshooting' },
          { text: 'Contributing', link: '/guide/contributing' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/itsiurisilva/sDeck' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present Iuri Silva'
    },
    search: {
      provider: 'local'
    },
    editLink: {
      pattern: 'https://github.com/itsiurisilva/sDeck/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
});
