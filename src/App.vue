<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
    <div class="textarea-list">
      <div class="base-textarea-container">
        <BaseTextarea content="" placeholder="请输入内容" />
      </div>
      <div class="base-textarea-container">
        <MagicTextarea content="" placeholder="请输入内容" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BaseTextarea, MagicTextarea } from ".";
</script>

<style lang="less" scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.textarea-list {
  display: flex;
  justify-content: space-around;
  width: 100%;
  height: auto;
  column-gap: 16px;
  .base-textarea-container {
    width: 360px;
    height: 80px;
  }
}
</style>
