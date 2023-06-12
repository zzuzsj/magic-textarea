<template>
  <div
    class="menu-list"
    :style="{
      width: `${width}px`,
      maxHeight: `${maxHeight}px`,
    }"
  >
    <div
      :class="{ 'menu-item': true, 'menu-item-highlight': itemIndex === index }"
      v-for="(item, index) in list"
      :key="item.value"
      @click="handleClick(item)"
      @mouseenter="
        () => {
          itemIndex = index;
        }
      "
    >
      {{ item.label }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRef } from "vue";

type ItemType = Record<string, string | number | boolean> & {
  value: string;
  label: string;
};
const props = withDefaults(
  defineProps<{
    list: ItemType[];
    type: string;
    value?: string;
    width?: number;
    maxHeight?: number;
  }>(),
  {
    width: 180,
    maxHeight: 360,
  }
);
const list = toRef(props, "list");
const itemIndex = ref(0);
const emit = defineEmits(["select"]);
const handleClick = (item: ItemType) => {
  emit("select", props.type, item);
};
const listLength = computed(() => list.value.length);
const next = () => {
  if (listLength.value === 0) return;
  itemIndex.value++;
  if (itemIndex.value >= listLength.value) {
    itemIndex.value = 0;
  }
};
const pre = () => {
  if (listLength.value === 0) return;
  itemIndex.value--;
  if (itemIndex.value < 0) {
    itemIndex.value = listLength.value - 1;
  }
};
const confirm = () => {
  const item = list.value[itemIndex.value];
  if (item) {
    handleClick(item);
  }
};
defineExpose({
  next,
  pre,
  confirm,
});
</script>

<style lang="less" scoped>
.menu-list {
  display: block;
  padding: 4px 0;
  height: auto;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #ffffff;
  border: 1px solid rgb(228, 231, 237);
  box-shadow: rgba(0, 0, 0, 0.12) 0px 0px 12px 0px;
  .menu-item {
    display: flex;
    font-size: 12px;
    line-height: 32px;
    padding: 0 8px;
    color: #303133;
    background-color: #ffffff;
    &.menu-item-highlight {
      color: #409eff;
      background-color: #79bbff;
    }
  }
}
</style>
