import { useEventListener, onClickOutside, onKeyStroke } from "@vueuse/core";
import { Ref, watchEffect, computed, nextTick, onMounted, ref } from "vue";

import {
  deleteByRange,
  getRangeWord,
  insertTextByRange,
} from "@/utils/text-range";
import {
  ISignalHandleOperator,
  ExtraData,
  SignalData,
  SignalOperatorCallbackData,
  SignalOperatorOptions,
} from "@/types";
import { isFunction, noop } from "lodash-es";

// 获取焦点并进行聚焦 焦点将会聚焦在开始输入节点的后一个元素上 需要区分开始聚焦节点是在 text 节点还是 p 节点
function setRangeNextWordFocus(inputDom: HTMLElement, focusOffset: number) {
  inputDom.focus();
  // 创建一个新的 Range 对象
  const newRange = document.createRange();
  // 将 Range 对象的起始点和结束点设置为指定位置
  newRange.setStart(inputDom, focusOffset);
  newRange.setEnd(inputDom, focusOffset);
  // 将 Range 对象对应的文本区域设置为新 Range 对象
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(newRange);
}

export function createSignalHTMLString(data: SignalData, domClass?: string) {
  const { signal, type, content, props = {} } = data;
  // contenteditable 设为 false 让 dom 节点不可编辑
  const classStr = domClass ? `class="${domClass}"` : "";
  const propsStr = JSON.stringify(props);
  return `<span contenteditable="false" ${classStr} data-signal="${signal}" data-signal-type="${type}" data-signal-props='${propsStr}'>${content}</span>`;
}

// 获取干净有效的 html 数据信息
export function getValidHTMLContent(val: string) {
  return (val || "")
    .replace(/&nbsp;/g, " ")
    .replace(/<div><br><\/div>/g, " ")
    .replace(/(<br\/?>)+$/g, "")
    .trim();
}

export function useTextareaInput(options: {
  inputDom: Ref<HTMLElement | undefined>;
  defaultFocus: boolean;
  defaultContent: string;
  onInput?: (e: Event) => void;
}) {
  const {
    inputDom,
    defaultFocus,
    defaultContent,
    onInput: handleInput,
  } = options;
  // 中文输入状态
  const chineseInput = ref(false);

  const isFocus = ref(false);
  const contentValue = ref("");

  const signalMap: Map<string, SignalOperatorOptions> = new Map();
  const signalOperatorMap: Map<string, string> = new Map();
  let currentSignalOperator:
    | (SignalOperatorOptions & { operator?: Promise<SignalData> })
    | null = null;
  // 缓存富文本当前 range
  const currentRange: Ref<Range | undefined> = ref();
  const signalStartRange: Ref<
    | (Range & {
        $startOffset?: number;
      })
    | undefined
  > = ref();

  const hasContent = computed(() => {
    const content = getValidHTMLContent(contentValue.value);
    return content.length > 0;
  });

  watchEffect(() => {
    setSignalOperatorCancel();
    setContent(defaultContent);
  });

  function registerSignalOperator(registerOptions: SignalOperatorOptions) {
    const { type, signal } = registerOptions;
    // 匹配符不能出现重复
    if (signalOperatorMap.get(signal)) throw new Error("匹配符不能出现重复");
    signalMap.set(type, registerOptions);
    signalOperatorMap.set(signal, type);
  }

  function getSignalOperatorCallbackData(
    operatorOptions: SignalOperatorOptions
  ): SignalOperatorCallbackData {
    if (!currentSignalOperator) throw new Error("未找到匹配操作");
    const { type, signal } = operatorOptions;
    return { type, signal, inputDom, currentRange };
  }

  function onInput(
    e: Event & {
      data?: string;
    }
  ) {
    // 中文输入法还在输入时不做处理
    if (chineseInput.value) {
      e.preventDefault();
      return;
    }
    // 输入@, 缓存起始 range 对象
    handleInput?.(e);
    const isSignalStr = signalOperatorMap.get(e.data);
    if (isSignalStr) {
      // 匹配到新的起始符 需要把当前匹配操作清除
      if (currentSignalOperator) {
        setSignalOperatorCancel();
      }
      // 缓存@起始位置的 range
      signalStartRange.value = window
        .getSelection()
        ?.getRangeAt(0)
        .cloneRange();

      if (signalStartRange.value) {
        // startOffset 会变，这里做一个额外的缓存
        signalStartRange.value.$startOffset =
          signalStartRange.value.startOffset;
        const signalOperator = signalMap.get(isSignalStr);
        setSignalOperatorStart(signalOperator);
      }
    }

    // 搜索
    contentValue.value = getContent();
    currentRange.value = window.getSelection()?.getRangeAt(0).cloneRange();

    if (!signalStartRange.value || !currentRange.value) return;

    const _signalStartRange = signalStartRange.value;
    const _currentRange = currentRange.value;

    // 当光标位置小于 @位置。取消@状态
    if (signalStartRange.value.$startOffset! > currentRange.value.startOffset) {
      setSignalOperatorCancel();
    }

    // 搜索
    const keyWord = getRangeWord(_signalStartRange, _currentRange);
    // options.onInput(keyWord);
    currentSignalOperator?.onSignalInput?.(
      getSignalOperatorCallbackData(currentSignalOperator),
      keyWord
    );
  }

  // 中文输入法开始事件
  function onInputCompositionStart() {
    chineseInput.value = true;
  }

  // 中文输入法结束事件
  function onInputCompositionEnd(e: CompositionEvent) {
    chineseInput.value = false;
    onInput(e);
  }

  function setSignalOperatorStart(signalOperator: SignalOperatorOptions) {
    currentSignalOperator = signalOperator;
    const funcs: ISignalHandleOperator = { confirm: noop, cancel: noop };
    const p: Promise<SignalData> = new Promise((resolve, reject) => {
      Object.assign(funcs, {
        confirm: resolve,
        cancel: reject,
      });
    });
    p.then((data: SignalData, extraData?: ExtraData) => {
      setSignalOperatorConfirm(data, extraData);
    }).catch(() => {
      setSignalOperatorCancel();
    });
    currentSignalOperator.onSignalStart?.(
      getSignalOperatorCallbackData(currentSignalOperator),
      funcs
    );
  }

  // extraData 是额外参数 不需要记录到 span 数据中
  function setSignalOperatorConfirm(
    data: SignalData,
    extraData?: Record<string, any>
  ) {
    if (!signalStartRange.value || !currentRange.value)
      throw new Error("当前不处于匹配操作中");
    deleteByRange(signalStartRange.value, currentRange.value);
    const { render, domClass } = currentSignalOperator;
    const tagHTMLString = render
      ? isFunction(render)
        ? render(data)
        : render
      : createSignalHTMLString(data, domClass);
    insertTextByRange(tagHTMLString, currentRange.value);

    // 通过 startRange 获取添加之后光标的位置
    const { endContainer: endNode, endOffset } = signalStartRange.value;
    const isStartRangeText = endNode.nodeType === Node.TEXT_NODE;
    let focusOffset = endOffset;
    let focusDom = inputDom.value;
    if (isStartRangeText) {
      focusDom = endNode.parentNode;
      const nodeIndex = Array.from(focusDom.childNodes).indexOf(endNode);
      focusOffset = nodeIndex;
    }

    // 添加定时器是为了异步聚焦，防止和点击操作冲突导致聚焦失败
    setTimeout(() => {
      // HACK: 每次添加 span 标签貌似会附带一个 text 所以这里要加 2
      const toFocusOffset = focusOffset + 2;
      setRangeNextWordFocus(focusDom, toFocusOffset);
      if (focusDom !== inputDom.value) {
        focusDom.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    });
    signalStartRange.value = undefined;
    currentSignalOperator?.onSignalConfirm?.(
      getSignalOperatorCallbackData(currentSignalOperator),
      data,
      extraData
    );
    currentSignalOperator = null;
    contentValue.value = getContent();
  }

  // 取消 @ 输入状态
  function setSignalOperatorCancel() {
    // 清除 range 缓存
    signalStartRange.value = undefined;
    currentSignalOperator?.onSignalCancel?.(
      getSignalOperatorCallbackData(currentSignalOperator)
    );
    currentSignalOperator = null;
  }

  function toggleFocus(bool: boolean) {
    isFocus.value = bool;
    // 监测到焦点缺失 取消自定义操作
    if (!bool) {
      setSignalOperatorCancel();
    }
    if (!bool && !hasContent.value) {
      clearInputContent();
    }
  }

  function clearInputContent() {
    setContent("");
  }

  function getContent(): string {
    return inputDom.value?.innerHTML ?? "";
  }

  function setContent(content: string) {
    if (inputDom.value) {
      inputDom.value.innerHTML = content;
    }
    contentValue.value = content;
  }

  function onInputPaste(e: ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain");
    text && document.execCommand("insertHTML", false, text);
    Object.assign(e, {
      data: text,
    });
    handleInput?.(e);
  }

  function onInputClick() {
    signalStartRange.value = undefined;
    handleFocus();

    setSignalOperatorCancel();
  }

  function onHandleKeyStroke(e: KeyboardEvent) {
    if (
      !chineseInput.value &&
      currentSignalOperator?.onSignalKeyStroke?.(
        getSignalOperatorCallbackData(currentSignalOperator),
        e
      )
    ) {
      e.preventDefault();
    }
  }

  async function handleFocus(collapseToEnd = false) {
    await nextTick();
    inputDom.value?.focus();

    if (window.getSelection && collapseToEnd) {
      const range = window.getSelection()!; // 创建 range
      range.selectAllChildren(inputDom.value!); // range 选择 obj 下所有子内容
      range.collapseToEnd(); // 光标移至最后
    }
  }

  onMounted(() => {
    const content = defaultContent;
    setContent(content || "");
    defaultFocus && handleFocus(true);

    useEventListener(inputDom.value!, "input", onInput);
    useEventListener(inputDom.value!, "click", onInputClick);
    useEventListener(inputDom.value!, "paste", onInputPaste);
    useEventListener(
      inputDom.value!,
      "compositionstart",
      onInputCompositionStart
    );
    useEventListener(inputDom.value!, "compositionend", onInputCompositionEnd);
    useEventListener(inputDom.value!, "focus", () => toggleFocus(true));
    // useEventListener(inputDom.value!, 'blur', () => toggleFocus(false));
    onKeyStroke(onHandleKeyStroke, {
      target: inputDom.value!,
    });

    onClickOutside(inputDom.value!, (evt: Event) => {
      // HACK: 特殊属性 增加属性之后点击 outside 不会触发失焦从而导致操作取消 为了交互流畅性目前不好有效去除
      // 需要自行处理好 confirm 或 cancel
      const preventDefaultAttribute = "data-signal-operator-ignore";
      let { target } = evt;
      let shouldPreventFocusEvent = false;
      while (target && target !== document) {
        if (
          target.nodeType === Node.ELEMENT_NODE &&
          target.hasAttribute(preventDefaultAttribute)
        ) {
          shouldPreventFocusEvent = true;
          break;
        }
        target = target.parentNode;
      }
      if (shouldPreventFocusEvent) return;
      toggleFocus(false);
    });
  });

  return {
    chineseInput,
    handleFocus,
    signalStartRange,
    currentRange,

    inputDom,
    isFocus,
    hasContent,
    contentValue,

    setContent,
    toggleFocus,
    clearInputContent,
    setSignalOperatorConfirm,
    setSignalOperatorCancel,
    registerSignalOperator,
  };
}
