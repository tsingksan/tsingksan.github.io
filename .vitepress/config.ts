import { defineConfig } from 'vitepress'
import { genFeed } from './genFeed.js'

export default defineConfig({
  title: 'The tsingksan Point',
  // description: 'The official blog for the Vue.js project',
  cleanUrls: true,
  head: [
    ['meta', { name: 'twitter:site', content: '@tsingksan' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    // [
    //   'meta',
    //   {
    //     name: 'twitter:image',
    //     content: 'https://vuejs.org/images/logo.png'
    //   }
    // ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.svg'
      }
    ],
    [
      'script',
      {
        src: 'https://cdn.usefathom.com/script.js',
        'data-site': 'NYHGSGQV',
        'data-spa': 'auto',
        defer: ''
      }
    ]
  ],
  buildEnd: genFeed,

  lang: 'zh-CN',
  srcDir: 'posts',
  rewrites: {
    '/': 'blogs/index.md',
  },
  ignoreDeadLinks: true
})
