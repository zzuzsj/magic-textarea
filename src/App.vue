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
        <BaseTextarea
          content=""
          placeholder="请输入内容"
          @change="handleChange"
        />
      </div>
      <div class="base-textarea-container">
        <MagicTextarea
          content=""
          placeholder="请输入内容"
          :options="initRegisterOptions"
          @change="handleChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BaseTextarea, MagicTextarea } from ".";
import { RenderItem } from "@/types";

const generateList = (label: string, length: number) => {
  return new Array(length).fill(0).map((_cv, i) => {
    const index = i + 1;
    return {
      value: `${index}`,
      label: `${label} ${index}`,
    };
  });
};
const initRegisterOptions = [
  {
    type: "member",
    signal: "@",
    signalClass: "member-signal-item",
    renderList: generateList("用户", 20),
    generateProps({ value, label }: RenderItem) {
      return {
        user_id: value,
        user_name: label,
      };
    },
  },
  {
    type: "page",
    signal: "/",
    signalClass: "page-signal-item",
    renderList: generateList("页面", 20),
    generateProps({ value, label }: RenderItem) {
      return {
        page_id: value,
        page_name: label,
      };
    },
  },
  {
    type: "tag",
    signal: "#",
    signalClass: "tag-signal-item",
    renderList: generateList("话题", 20),
    generateProps({ value, label }: RenderItem) {
      return {
        tag_id: value,
        tag_name: label,
      };
    },
  },
];

// 监听内容更改事件
const handleChange = (val: string) => {
  console.log(val);
};
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
