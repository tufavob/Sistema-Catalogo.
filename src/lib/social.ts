import type { ComponentType } from "react";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/icons";

export type SocialLink = {
  label: string;
  href: string;
  Icon: ComponentType<{ className?: string }>;
  placeholder?: boolean;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@roman_barrios20?lang=es",
    Icon: TikTokIcon,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/romanjrbarrios.5",
    Icon: FacebookIcon,
  },
  {
    label: "Instagram",
    href: "#",
    Icon: InstagramIcon,
    placeholder: true,
  },
];
