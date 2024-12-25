import path from 'path'
import { writeFileSync } from 'fs'
import { Feed } from 'feed'
import { createContentLoader, type SiteConfig } from 'vitepress'

const baseUrl = `https://tsingksan.github.io`

export async function genFeed(config: SiteConfig) {
  const feed = new Feed({
    title: 'Coding Notes | tsingskan的技术笔记',
    description: '这里是 tsingskan 的技术游乐场！用轻松的文字记录技术点滴，用简单的方式理解复杂的问题。欢迎来到我的代码乐园！',
    id: baseUrl,
    link: baseUrl,
    language: 'zh',
    image: 'https://vuejs.org/images/logo.png',
    favicon: `${baseUrl}/favicon.ico`,
    copyright:
      ''
  })

  const posts = (await createContentLoader('/**/*.md', {
    excerpt: true,
    render: true
  }).load()).filter(item => !item.frontmatter.index)

  posts.sort(
    (a, b) =>
      +new Date(b.frontmatter.date as string) -
      +new Date(a.frontmatter.date as string)
  )

  for (const { url, excerpt, frontmatter, html } of posts) {
    feed.addItem({
      title: frontmatter.title,
      id: `${baseUrl}${url}`,
      link: `${baseUrl}${url}`,
      description: excerpt,
      content: html?.replaceAll('&ZeroWidthSpace;', ''),
      author: [
        {
          name: frontmatter.author,
          link: frontmatter.twitter
            ? `https://twitter.com/${frontmatter.twitter}`
            : undefined
        }
      ],
      date: frontmatter.date
    })
  }

  writeFileSync(path.join(config.outDir, 'feed.rss'), feed.rss2())
}
