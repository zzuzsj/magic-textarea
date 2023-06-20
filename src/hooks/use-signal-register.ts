import { Ref } from "vue";
import type { SignalOperatorOptions } from "@/types";
import BaseTextarea from "@/components/base-textarea/index.vue";

export function useSignalRegister({
  baseTextarea,
}: {
  baseTextarea: Ref<typeof BaseTextarea>;
}) {
  const registerOrUpdateSignal = (options: SignalOperatorOptions) => {
    if (baseTextarea.value) {
      baseTextarea.value.registerSignalOperator(options);
    } else {
      throw new Error(
        "Please register after the BaseTextarea component has finished rendering."
      );
    }
  };

  return { registerOrUpdateSignal };
}
