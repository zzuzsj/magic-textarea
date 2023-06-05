import { Ref, ref } from "vue";
import type {
  SignalData,
  SignalOperatorOptions,
  SignalOperatorCallbackData,
  ExtraData,
} from "@/types";

export interface CommentUser {
  user_id: string;
  user_name: string;
}

type MemberSignalData = SignalData<CommentUser>;

interface MemberRegisterOptions {
  permissionManageAble: Ref<boolean>;
  memberItemClass: string;
  onAtMember: (user: CommentUser) => void;
  onSignalKeyStroke: (
    options: SignalOperatorOptions,
    e: KeyboardEvent
  ) => boolean;
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

export function useMemberRegister({
  permissionManageAble,
  memberItemClass,
  onAtMember,
  onSignalKeyStroke,
}: MemberRegisterOptions): {
  userList: Ref<Required<CommentUser>[]>;
  userSelectVisible: Ref<boolean>;
  userPermissionTipVisible: Ref<boolean>;
  currentInputUserName: Ref<string>;
  currentRangePosition: Ref<{ top: number; left: number }>;
  signalOption: SignalOperatorOptions;
  signalOperatorHandles: Ref<{
    confirm: (data: SignalData, extraData: { visitor: number }) => void;
    cancel: () => void;
  } | null>;
} {
  const userSelectVisible = ref(false);
  const userPermissionTipVisible = ref(false);
  const currentInputUserName = ref("");
  const currentRangePosition = ref({
    top: 0,
    left: 0,
  });
  const toggleUserSelect = (val: boolean) => {
    userSelectVisible.value = val;
  };
  const toggleUserPermissionTip = (val: boolean) => {
    if (!permissionManageAble.value) return;
    userPermissionTipVisible.value = val;
  };
  const type = "member";
  const signal = "@";
  const domClass = memberItemClass;
  const signalOperatorHandles: Ref<{
    confirm: (data: SignalData) => void;
    cancel: () => void;
  } | null> = ref(null);
  const onSignalStart = (options: SignalOperatorCallbackData, funcs) => {
    toggleUserSelect(true);
    currentInputUserName.value = "";
    signalOperatorHandles.value = funcs;
    const { left, top } = getPositionFromRange(options);
    currentRangePosition.value = {
      left,
      top,
    };
  };
  const onSignalCancel = () => {
    toggleUserSelect(false);
    currentInputUserName.value = "";
    signalOperatorHandles.value = null;
  };
  const onSignalConfirm = (
    options: SignalOperatorCallbackData,
    signalData: MemberSignalData,
    extraData?: ExtraData
  ) => {
    currentInputUserName.value = "";
    toggleUserSelect(false);
    toggleUserPermissionTip(true);
    signalOperatorHandles.value = null;
    const { props } = signalData;
    if (props) {
      onAtMember(props);
    }
  };
  const onSignalInput = (options: SignalOperatorCallbackData, val: string) => {
    currentInputUserName.value = val;
    // 输入过程中 匹配到特定字符可以提前中断自定义操作
    const breakWords = [/\s/];
    const shouldSignalBreak = breakWords.some((cv) => cv.test(val));
    if (shouldSignalBreak) {
      signalOperatorHandles.value?.cancel();
    }
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
  return {
    signalOption,
    currentRangePosition,
    signalOperatorHandles,
    currentInputUserName,
    userSelectVisible,
    userPermissionTipVisible,
  };
}
