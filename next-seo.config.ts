import { DefaultSeoProps } from 'next-seo';

const config: DefaultSeoProps = {
    openGraph: {
        type: 'website',
        locale: 'pt-BR',
        url: 'https://www.fluencychat.com/',
        siteName: 'FluencyChat',
    },
    twitter: {
        handle: '@handle',
        site: '@site',
        cardType: 'summary_large_image',
    },
};

export default config;