import { DefaultSeoProps } from 'next-seo';

const config: DefaultSeoProps = {
  openGraph: {
    type: 'website',
    locale: 'pt-BR',
    url: 'https://www.doupi.com/',
    siteName: 'doupi',
  },
  twitter: {
    handle: '@handle',
    site: '@site',
    cardType: 'share-image.jpg',
  },
};

export default config;
