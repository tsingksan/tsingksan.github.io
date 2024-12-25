<script setup lang="ts">
import { useData, useRouter } from 'vitepress'
import Home from './Home.vue'
import Article from './Article.vue'
import NotFound from './NotFound.vue'

const { page, frontmatter } = useData()
const { go } = useRouter()
</script>

<template>
  <div class="antialiased min-h-screen dark:bg-slate-900">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 xl:max-w-5xl xl:px-0">
      <nav class="flex justify-between items-center py-10 font-bold">
        <a class="text-xl" href="/blogs/" aria-label="The tsingksan Point">
          <img
            class="inline-block mr-2"
            style="width: 36px; height: 31px"
            alt="logo"
            src="/favicon.svg"
          />
          <span
            v-if="!frontmatter.index"
            class="hidden md:inline dark:text-white"
            >The tsingksan Point</span
          >
        </a>
        <div class="text-sm text-gray-500 dark:text-white leading-5">
          <!-- <a
            class="hover:text-gray-700 dark:hover:text-gray-200"
            href="https://github.com/vuejs/blog"
            target="_blank"
            rel="noopener"
            ><span class="hidden sm:inline">GitHub </span>Source</a
          >
          <span class="mr-2 ml-2">·</span> -->
          <div
            class="inline hover:text-gray-700 dark:hover:text-gray-200 vp-raw cursor-pointer"
            @click="go('/blogs/')"
            >Blog</div
          >
          <span class="mr-2 ml-2">·</span>
          <a
            class="hover:text-gray-700 dark:hover:text-gray-200"
            href="https://github.com/tsingksan"
            target="_blank"
            rel="noopener"
            >GitHub →</a
          >
        </div>
      </nav>
    </div>
    <main class="max-w-3xl mx-auto px-4 sm:px-6 xl:max-w-5xl xl:px-0">
      <Home v-if="frontmatter.index" />
      <NotFound v-else-if="page.isNotFound" />
      <Article v-else />
    </main>
  </div>
</template>
