<template>
  <div class="magic-textarea" ref="containerNode">
    <BaseTextarea
      ref="baseTextarea"
      :content="content"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :autoFocus="autoFocus"
      @change="handleContentChange"
    />
  </div>
</template>

<script lang="ts" setup>
import BaseTextarea from "@/components/base-textarea/index.vue";
import { useSignalRegister } from "@/hooks/use-signal-register";
import { onMounted, ref } from "vue";

defineProps<{
  content: string;
  placeholder: string;
  disabled: boolean;
  readonly: boolean;
  autoFocus: boolean;
}>();
const containerNode = ref();
const baseTextarea = ref();
const content = ref("");
const generateList = (label: string, length: number) => {
  return new Array(length).fill(0).map((_cv, i) => {
    const index = i + 1;
    return {
      value: `${index}`,
      label: `${label} ${index}`,
    };
  });
};
const { registerSignal } = useSignalRegister({
  containerNode,
  baseTextarea,
});

// 需要在 baseTextarea 渲染之后才能进行注册
onMounted(() => {
  registerSignal({
    type: "member",
    signal: "@",
    signalClass: "member-signal-item",
    renderList: generateList("用户", 20),
    generateProps({ value, label }) {
      return {
        user_id: value,
        user_name: label,
      };
    },
  });
  registerSignal({
    type: "page",
    signal: "/",
    signalClass: "page-signal-item",
    renderList: generateList("页面", 20),
    generateProps({ value, label }) {
      return {
        page_id: value,
        page_name: label,
      };
    },
  });
  registerSignal({
    type: "tag",
    signal: "#",
    signalClass: "tag-signal-item",
    renderList: generateList("话题", 20),
    generateProps({ value, label }) {
      return {
        tag_id: value,
        tag_name: label,
      };
    },
  });
});

const handleContentChange = (val: string) => {
  content.value = val;
};
</script>

<style lang="less">
.member-signal-item {
  color: #409eff;
}
.page-signal-item {
  color: #e6a23c;
}
.tag-signal-item {
  color: #f56c6c;
}
</style>
<style lang="less" scoped>
.magic-textarea {
  position: relative;
}
</style>
