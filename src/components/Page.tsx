import { NextSeo } from 'next-seo';
import Navbar from './Navbar';
import { IUser } from '@/types/api/User';
import { Box, Flex } from '@chakra-ui/react';
import Footer from '@/components/Footer';

interface IProps {
  user?: IUser;
  title: string;
  description: string;
  path: string;
  children: any;
}

export default function Page({
  user,
  title,
  description,
  path,
  children,
}: IProps) {
  const url = process.env.NEXT_PUBLIC_API_URL + path;
  return (
    <Box flex={1} minH={'100vh'}>
      <Box pb={'90px'}>
        <NextSeo
          title={title}
          description={description}
          canonical={url}
          openGraph={{
            url,
            title,
          }}
        />
        <Navbar user={user} />
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
