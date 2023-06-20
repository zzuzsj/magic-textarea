<template>
  <div class="magic-textarea" ref="containerNode">
    <BaseTextarea ref="baseTextarea" v-bind="$attrs" v-on="$listeners" />
  </div>
</template>

<script lang="ts" setup>
import BaseTextarea from "@/components/base-textarea/index.vue";
import { useSignalMenulist } from "@/hooks/use-signal-menulist";
import { useSignalRegister } from "@/hooks/use-signal-register";
import type { RegisterOptions } from "@/types";
import { isArray } from "lodash-es";
import { onMounted, ref, toRef, watch } from "vue";

const props = defineProps<{
  // 初始内容
  content: string;
  placeholder: string;
  disabled: boolean;
  readonly: boolean;
  // 渲染的时候是否自动聚焦
  autoFocus: boolean;
  // 注册信息
  options: RegisterOptions[];
}>();
const containerNode = ref();
const baseTextarea = ref();
const content = ref("");
const options = toRef(props, "options");

const { registerOrUpdateSignal } = useSignalRegister({
  baseTextarea,
});
const { createRegisterSignalOptions } = useSignalMenulist({
  containerNode,
});
const isMounted = ref(false);

// 注册或者更新选项列表
const registerAllOptions = () => {
  if (!(isArray(options.value) && options.value.length > 0)) return;
  options.value.forEach((option) => {
    const signalOption = createRegisterSignalOptions(option);
    registerOrUpdateSignal(signalOption);
  });
};

watch([options, isMounted], () => {
  if (isMounted.value) {
    registerAllOptions();
  }
});

// 需要在 baseTextarea 渲染之后才能进行注册
onMounted(() => {
  isMounted.value = true;
});
</script>

<style lang="less">
.member-signal-item {
  padding: 0 4px;
  color: #409eff;
}
.page-signal-item {
  padding: 0 4px;
  color: #e6a23c;
}
.tag-signal-item {
  padding: 0 4px;
  color: #f56c6c;
}
</style>
<style lang="less" scoped>
.magic-textarea {
  position: relative;
}
</style>
