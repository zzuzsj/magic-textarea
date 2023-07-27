import type { Meta, StoryObj } from "@storybook/vue3";

import MagicTextarea from "../components/magic-textarea/index.vue";
import { RenderItem } from "@/types";

// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction
const meta = {
  title: "Example/MagicTextarea",
  component: MagicTextarea,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/vue/writing-docs/autodocs
  tags: ["autodocs"],
  argTypes: {
    content: { control: "text" },
    placeholder: { control: "text" },
    readonly: { control: "boolean" },
    disabled: { control: "boolean" },
    autoFocus: { control: "boolean" },
    options: { control: "object" },
  },
  args: {
    placeholder: "",
    disabled: false,
    content: "",
    autoFocus: false,
    readonly: false,
    options: [],
  }, // default value
} satisfies Meta<typeof MagicTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/vue/api/csf
 * to learn how to use render functions.
 */

const generateList = (label: string, length: number) => {
  return new Array(length).fill(0).map((_cv, i) => {
    const index = i + 1;
    return {
      value: `${index}`,
      label: `${label} ${index}`,
    };
  });
};
export const Primary: Story = {
  args: {
    placeholder: "",
    disabled: false,
    content: "",
    autoFocus: false,
    readonly: false,
    options: [
      {
        type: "member",
        signal: "@",
        signalClass: "member-signal-item",
        renderList: generateList("用户", 20),
        generateProps({ value, label }: RenderItem) {
          return {
            user_id: value,
            user_name: label,
          };
        },
      },
    ],
  },
};
