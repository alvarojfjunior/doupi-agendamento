// pages/_app.js
import type { AppProps } from "next/app";
import { ChakraProvider, Flex } from "@chakra-ui/react";
import NextNProgress from "nextjs-progressbar";
import { AuthProvider } from "@/contexts/auth";
import { AppProvider } from "@/contexts/app";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { DefaultSeo } from 'next-seo'
import seoConfigs from '../../next-seo.config'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <DefaultSeo {...seoConfigs} />
      <NextNProgress />
      <AppProvider>
        <AuthProvider>
          <Flex direction={'column'} justifyContent={'space-between'} height={'100vh'}>
            <Navbar />
            <Component {...pageProps} />
            <Footer />
          </Flex>
        </AuthProvider>
      </AppProvider>
    </ChakraProvider>
  );
}

export default MyApp;
