import { Ref, ref, h, VNode, render } from "vue";
import type {
  SignalData,
  SignalOperatorCallbackData,
  SignalOperatorOptions,
} from "@/types";
import MenuList from "@/components/menu-list/index.vue";
import BaseTextarea from "@/components/base-textarea/index.vue";

export interface CommentUser {
  user_id: string;
  user_name: string;
}

export type RenderItem = Record<string, string | number | boolean> & {
  value: string;
  label: string;
};

// 获取光标在 inputDom 中的位置信息 以及输入框的宽高信息
const getPositionFromRange = ({
  inputDom,
}: Pick<SignalOperatorCallbackData, "inputDom" | "currentRange">) => {
  if (!inputDom.value) {
    return {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
    };
  }
  const {
    top: inputTop,
    left: inputLeft,
    width: inputWidth,
    height: inputHeight,
  } = inputDom.value.getBoundingClientRect();
  const range = window.getSelection()?.getRangeAt(0);
  const { top, left } = range.getBoundingClientRect();
  const offsetTop = top - inputTop;
  const offsetLeft = left - inputLeft;
  return {
    top: offsetTop,
    left: offsetLeft,
    width: inputWidth,
    height: inputHeight,
  };
};

interface RegisterOptions {
  // signal type
  type: string;
  // signal 起始符
  signal: string;
  // signal class
  signalClass?: string;
  // 渲染的列表
  renderList: RenderItem[];
  // 生成 signal-props 数据
  generateProps: (item: RenderItem) => Record<string, any>;
}

export function useSignalRegister({
  baseTextarea,
  containerNode,
}: {
  baseTextarea: Ref<typeof BaseTextarea>;
  containerNode: Ref<HTMLElement>;
}) {
  const createRegisterSignalOptions = (options: RegisterOptions) => {
    const { type, signal, signalClass, renderList, generateProps } = options;
    const currentRangePosition: Ref<{ top: number; left: number }> = ref({
      top: 0,
      left: 0,
    });
    const domClass = signalClass;
    const signalOperatorHandles: Ref<{
      confirm: (data: SignalData) => void;
      cancel: () => void;
    } | null> = ref(null);
    const currentInputValue = ref("");
    const isSignalInputing = ref(false);
    let menuListNode: VNode | null = null;

    const renderMenuList = () => {
      const onSelect = (item: RenderItem) => {
        const props = generateProps(item);
        const content = `${signal}${item.label}`;
        signalOperatorHandles.value?.confirm({
          type,
          signal,
          content,
          props,
        });
      };
      menuListNode = h(MenuList, {
        list: renderList,
        type,
        value: currentInputValue.value,
        onSelect,
      });
      render(menuListNode, containerNode.value);
      console.log(menuListNode);
      menuListNode.el!.style = {
        position: "absolute",
        left: `${currentRangePosition.value.left}px`,
        top: `${currentRangePosition.value.top}px`,
        zIndex: 1000,
      };
    };

    const hideMenuList = () => {
      menuListNode?.el?.remove();
      menuListNode = null;
    };

    // watch(currentInputValue, () => {
    //   if (menuListNode) {
    //     patch(menuListNode, {
    //       props: {
    //         value: currentInputValue.value,
    //       },
    //     });
    //   }
    // });

    const onSignalStart = (options: SignalOperatorCallbackData, funcs) => {
      signalOperatorHandles.value = funcs;
      isSignalInputing.value = true;
      const { left, top } = getPositionFromRange(options);
      currentRangePosition.value = {
        left,
        top,
      };
      renderMenuList();
    };
    const onSignalCancel = () => {
      signalOperatorHandles.value = null;
      currentInputValue.value = "";
      isSignalInputing.value = false;
    };
    const onSignalConfirm = () => {
      currentInputValue.value = "";
      isSignalInputing.value = false;
      signalOperatorHandles.value = null;
    };
    const onSignalInput = (
      options: SignalOperatorCallbackData,
      val: string
    ) => {
      currentInputValue.value = val;
      // 输入过程中 匹配到特定字符可以提前中断自定义操作
      const breakWords = [/\s/];
      const shouldSignalBreak = breakWords.some((cv) => cv.test(val));
      if (shouldSignalBreak) {
        signalOperatorHandles.value?.cancel();
      }
    };

    const getExposedProxy = () => {
      return menuListNode?.component?.exposed ?? null;
    };

    const onSignalKeyStroke = (_o: SignalOperatorOptions, e: KeyboardEvent) => {
      if (!menuListNode) return false;
      let shouldPrevent = false;
      switch (e.code) {
        case "Enter": {
          // 回车选中
          getExposedProxy()?.confirm();
          break;
        }
        case "ArrowDown": {
          getExposedProxy()?.next();
          shouldPrevent = true;
          break;
        }
        case "ArrowUp": {
          getExposedProxy()?.pre();
          shouldPrevent = true;
          break;
        }
        case "Escape": {
          hideMenuList();
          shouldPrevent = true;
          break;
        }
        default:
          break;
      }
      return shouldPrevent;
    };

    const signalOption = {
      type,
      signal,
      domClass,
      onSignalCancel,
      onSignalStart,
      onSignalInput,
      onSignalConfirm,
      onSignalKeyStroke,
    };
    return signalOption;
  };

  const registerSignal = (options: RegisterOptions) => {
    const signalOptions = createRegisterSignalOptions(options);
    if (baseTextarea.value) {
      baseTextarea.value.registerSignalOperator(signalOptions);
    } else {
      throw new Error(
        "Please register after the BaseTextarea component has finished rendering."
      );
    }
  };

  return { registerSignal, createRegisterSignalOptions };
}
