import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Tsingksan",
  description: "my blog",
  logo: "/logo.png",
  siteTitle: false,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "Blog", link: "/blog" }],

    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
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
