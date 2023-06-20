import { Ref, ref, h, VNode, render } from "vue";
import type {
  RegisterOptions,
  RenderItem,
  SignalData,
  SignalOperatorCallbackData,
  SignalOperatorOptions,
} from "@/types";
import MenuList from "@/components/menu-list/index.vue";

interface SignalStartCallback {
  confirm: (data: SignalData) => void;
  cancel: () => void;
}

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
  if (!range)
    return {
      top: 0,
      left: 0,
      width: inputWidth,
      height: inputHeight,
    };
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

export function useSignalMenulist({
  containerNode,
}: {
  containerNode: Ref<HTMLElement>;
}) {
  const createRegisterSignalOptions = (
    options: RegisterOptions
  ): SignalOperatorOptions => {
    const { type, signal, signalClass, renderList, generateProps } = options;
    const currentRangePosition: Ref<{ top: number; left: number }> = ref({
      top: 0,
      left: 0,
    });
    const domClass = signalClass;
    const signalOperatorHandles: Ref<SignalStartCallback | null> = ref(null);
    const currentInputValue = ref("");
    const isSignalInputing = ref(false);
    let menuListNode: VNode | null = null;

    const renderMenuList = () => {
      const onSelect = (type: string, item: RenderItem) => {
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
        // 通过 key 值让每次生成的 dom 节点唯一
        key: Math.random().toString(),
        width: 180,
        list: renderList,
        type,
        value: currentInputValue.value,
        onSelect,
      });
      render(menuListNode, containerNode.value);
      if (menuListNode.el) {
        menuListNode.el.setAttribute("data-signal-operator-ignore", "");
        Object.assign(menuListNode.el.style, {
          position: "absolute",
          left: `${currentRangePosition.value.left}px`,
          top: `${currentRangePosition.value.top + 24}px`,
          zIndex: 1000,
        });
      }
    };

    const hideMenuList = () => {
      menuListNode && menuListNode.el && menuListNode.el.remove(); // 移除之前的 DOM 节点
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

    const onSignalStart = (
      options: SignalOperatorCallbackData,
      funcs: SignalStartCallback
    ) => {
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
      hideMenuList();
    };
    const onSignalConfirm = () => {
      currentInputValue.value = "";
      isSignalInputing.value = false;
      signalOperatorHandles.value = null;
      hideMenuList();
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

  return { createRegisterSignalOptions };
}
