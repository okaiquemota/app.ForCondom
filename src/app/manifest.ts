import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ForCondom",
    short_name: "ForCondom",
    description: "A economia do seu condomínio, organizada.",
    start_url: "/inicio",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#c2410c",
    lang: "pt-BR",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
