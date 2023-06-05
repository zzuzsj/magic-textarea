<template>
  <div
    :class="{
      'comment-input': true,
      inactive: !isActive,
      focus: isFocus && !disabled,
    }"
  >
    <p
      ref="inputDom"
      :contenteditable="!readonly && !disabled"
      :class="{
        'comment-textarea': true,
        disabled: disabled,
      }"
      :placeholder="placeholder"
    ></p>
    <slot name="footer"></slot>
  </div>
</template>

<script lang="ts" setup>
import { Ref, computed, onMounted, ref, watch } from "vue";
import { SignalOperatorOptions } from "@/types";
import { useTextareaInput } from "@/hooks/use-textarea-input";

// 该组件为不受控组件，从外部更改 content 不会更新内部的 contentValue 值，必须通过 expose 的 setContent 属性来控制（受限于 innerHTML 的实现）
const props = defineProps<{
  content: string;
  placeholder: string;
  disabled: boolean;
  readonly: boolean;
  autoFocus: boolean;
  signalOperators: SignalOperatorOptions[];
}>();
const emit = defineEmits([
  "on-change",
  "on-input",
  "on-focus",
  "on-blur",
  "on-active-change",
]);
const inputDom: Ref<HTMLElement | undefined> = ref();
const {
  isFocus,
  toggleFocus,
  setContent,
  hasContent,
  contentValue,
  registerSignalOperator,
} = useTextareaInput({
  inputDom,
  defaultFocus: props.autoFocus,
  defaultContent: props.content,
  onInput: (e) => {
    const { data } = e;
    emit("on-input", data);
  },
});
const isActive = computed(() => {
  return isFocus.value && hasContent.value;
});

// 暴露给外部使用
defineExpose({
  setContent,
  toggleFocus,
});

watch(isFocus, () => {
  if (isFocus.value) {
    emit("on-focus");
  } else {
    emit("on-blur");
  }
});
watch(isActive, () => {
  emit("on-active-change", isActive.value);
});

watch(contentValue, () => {
  emit("on-change", contentValue.value);
});

onMounted(() => {
  props.signalOperators.forEach((cv) => {
    registerSignalOperator(cv);
  });
});
</script>

<style lang="less" scoped>
.comment-input {
  position: relative;
  width: 100%;
  height: auto;
  background-color: var(--background-color-primary-regular);
  border: 1px solid var(--border-color-primary-regular);
  border-radius: var(--border-radius-large);

  &:hover {
    border: 1px solid var(--border-color-primary-hover) !important;
  }

  &.inactive .comment-textarea {
    height: 40px;
  }
  &.focus {
    color: var(--text-color-primary);
    border: 1px solid var(--border-color-primary-hover) !important;
    outline: none;
  }

  .comment-textarea {
    width: 100%;
    height: 108px;
    padding: 8px 12px 0;
    margin-bottom: 0;
    overflow: auto;
    overflow: overlay;
    font-size: 14px;
    line-height: 22px;
    outline: none;
    cursor: auto;
    transition: 0.2s;

    &.disabled {
      pointer-events: none;
      color: var(--text-color-disabled);
    }

    &[contenteditable][placeholder]:empty::before {
      position: absolute;
      color: var(--text-color-placeholder);
      background-color: transparent;
      cursor: text;
      content: attr(placeholder);
    }
  }
}
</style>