import type { Meta, StoryObj } from "@storybook/vue3";

import BaseTextarea from "../components/base-textarea/index.vue";

// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction
const meta = {
  title: "Example/BaseTextarea",
  component: BaseTextarea,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/vue/writing-docs/autodocs
  tags: ["autodocs"],
  argTypes: {
    content: { control: "text" },
    placeholder: { control: "text" },
    readonly: { control: "boolean" },
    disabled: { control: "boolean" },
    autoFocus: { control: "boolean" },
  },
  args: {
    placeholder: "",
    disabled: false,
    content: "",
    autoFocus: false,
    readonly: false,
  }, // default value
} satisfies Meta<typeof BaseTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/vue/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  args: {
    placeholder: "",
    disabled: false,
    content: "",
    autoFocus: false,
    readonly: false,
  },
};
