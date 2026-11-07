import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Maily",
    short_name: "Maily",
    description: "Gerador de assinatura de e-mail profissional. Crie, personalize e exporte em HTML ou PNG.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#593bec",
    icons: [{ src: "/mascote/boas-vindas.png", sizes: "512x512", type: "image/png" }],
  };
}
