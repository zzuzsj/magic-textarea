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
import { Ref, computed, ref, watch } from "vue";
import { useTextareaInput } from "@/hooks/use-textarea-input";

// 该组件为不受控组件，从外部更改 content 不会更新内部的 contentValue 值，必须通过 expose 的 setContent 属性来控制（受限于 innerHTML 的实现）
const props = withDefaults(
  defineProps<{
    // 初始内容
    content?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    // 渲染的时候是否自动聚焦
    autoFocus?: boolean;
  }>(),
  {
    // 默认渲染文本
    placeholder: "",
    disabled: false,
    content: "",
    autoFocus: false,
    readonly: false,
  }
);
const emit = defineEmits(["change", "input", "focus", "blur", "active-change"]);
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
    emit("input", data);
  },
});
const isActive = computed(() => {
  return isFocus.value && hasContent.value;
});

// 暴露给外部使用
defineExpose({
  inputDom,
  setContent,
  toggleFocus,
  registerSignalOperator,
});

watch(isFocus, () => {
  if (isFocus.value) {
    emit("focus");
  } else {
    emit("blur");
  }
});
watch(isActive, () => {
  emit("active-change", isActive.value);
});

watch(contentValue, () => {
  emit("change", contentValue.value);
});
</script>

<style lang="less" scoped>
.comment-input {
  --magic-textarea-background-color: #ffffff;
  --magic-textarea-border-color: #4d7cff;
  --magic-textarea-border-radius: 8px;
  --magic-textarea-border-color-hover: #2254f4;
  --magic-textarea-text-color-primary: #222529;
  --magic-textarea-text-color-disabled: #b4b8bf;
  --magic-textarea-text-color-placeholder: #9da3ac;

  position: relative;
  width: 100%;
  height: auto;
  background-color: var(--magic-textarea-background-color);
  border: 1px solid var(--magic-textarea-border-color);
  border-radius: var(--magic-textarea-border-radius);
  box-sizing: border-box;

  p {
    box-sizing: border-box;
    padding: 0;
    margin-block-start: 0;
    margin-block-end: 0;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
  }

  &:hover {
    border: 1px solid var(--magic-textarea-border-color-hover) !important;
  }

  &.focus {
    color: var(--magic-textarea-text-color-primary);
    border: 1px solid var(--magic-textarea-border-color-hover) !important;
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
    word-break: break-all;

    &.disabled {
      pointer-events: none;
      color: var(--magic-textarea-text-color-disabled);
    }

    &[contenteditable][placeholder]:empty::before {
      position: absolute;
      color: var(--magic-textarea-text-color-placeholder);
      background-color: transparent;
      cursor: text;
      content: attr(placeholder);
    }
  }
}
</style>
