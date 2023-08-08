import { NextSeo } from 'next-seo';
import Navbar from './Navbar';
import { IUser } from '@/types/api/User';

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
    <>
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
    </>
  );
}
