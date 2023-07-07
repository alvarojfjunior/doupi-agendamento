import Head from "next/head";
import { NextSeo } from "next-seo"
import seoConfigs from "../../next-seo.config"
import { Component } from "react";

interface IProps {
    title: string;
    description: string;
    path: string;
    children: any
}

export default function Page({ title, description, path, children }: IProps) {
    const url = process.env.NEXT_PUBLIC_API_URL + path
    return <>
        <NextSeo 
            title={title} 
            description={description} 
            canonical={url}
            openGraph={{
                url,
                title
            }} />
        {children}
    </>

}

