import type { Ref } from "vue";

export type BaseTextareaProps = Partial<{
  // 初始内容
  content: string;
  placeholder: string;
  disabled: boolean;
  readonly: boolean;
  // 渲染的时候是否自动聚焦
  autoFocus: boolean;
}>;

export type RenderItem = Record<string, string | number | boolean> & {
  value: string;
  label: string;
};

export interface RegisterOptions {
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

export type ExtraData = Record<string, any>;
export interface SignalData<T = Record<string, string | number>> {
  signal: string;
  type: string;
  content: string;
  domClass?: string;
  props?: T;
}

export type SignalTypeData = Pick<SignalData, "signal" | "type">;
export interface SignalDomData {
  inputDom: Ref<HTMLElement | undefined>;
  currentRange: Ref<Range | undefined>;
}

export type SignalOperatorCallbackData = SignalTypeData & SignalDomData;

export interface ISignalHandleOperator {
  confirm: (data: SignalData, extraData?: ExtraData) => void;
  cancel: () => void;
}
export interface SignalOperatorOptions {
  type: string;
  signal: string;
  domClass?: string;
  render?: string | ((signalData: SignalData) => string);
  onSignalStart?: (
    data: SignalOperatorCallbackData,
    operator: ISignalHandleOperator
  ) => void;
  onSignalInput?: (data: SignalOperatorCallbackData, val: string) => void;
  onSignalCancel?: (data: SignalOperatorCallbackData) => void;
  onSignalConfirm?: (
    data: SignalOperatorCallbackData,
    signalData: SignalData,
    extraData?: ExtraData
  ) => void;
  // 监听键盘输入事件 如果返回 true 会触发 preventDefault.
  onSignalKeyStroke?: (
    data: SignalOperatorCallbackData,
    e: KeyboardEvent
  ) => boolean;
}
