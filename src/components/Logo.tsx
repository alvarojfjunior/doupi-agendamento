import Fluency from "@/public/fluency-logo.svg";
import Image, { StaticImageData } from "next/image";

export default function Logo(props: any) {
  return (
    <Image
      src={Fluency as StaticImageData}
      alt={"fluency-logo"}
      {...props}
    ></Image>
  );
}
