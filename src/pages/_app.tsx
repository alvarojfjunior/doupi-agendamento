// pages/_app.js
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import NextNProgress from 'nextjs-progressbar';
import { AppProvider } from '@/contexts/app';
import { DefaultSeo } from 'next-seo';
import seoConfigs from '../../next-seo.config';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <DefaultSeo {...seoConfigs} />
      <NextNProgress />
      <AppProvider>
        <Component {...pageProps} />
      </AppProvider>
    </ChakraProvider>
  );
}

export default MyApp;
