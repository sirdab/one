import Image from "next/image";
import logo from "../assets/sirdab-logo.svg";

export function SiteLogo(): React.JSX.Element {
  return (
    <Image
      src={logo}
      width={182}
      height={51}
      alt="Sirdab"
      className="site-logo"
      loading="eager"
    />
  );
}
