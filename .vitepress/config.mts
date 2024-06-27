import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Tsingksan",
  description: "my blog",
  logo: "/logo.png",
  siteTitle: false,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "Blog", link: "/SSH-manager" }],

    sidebar: [
      {
        text: "Blog",
        items: [
          { text: "SSH管理.md", link: "/SSH-manager" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/tsingksan" },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-present Todd Shan",
    },

    lastUpdated: true,

    search: {
      provider: "local",
    },
  },
});
