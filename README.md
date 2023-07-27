# Magic Textarea

Magic Textarea is a Vue 3 component that provides functionality for tagging or mentioning members in an input field.

## Installation

To use magic-textarea in your project, simply run:

```bash
npm install magic-textarea
```

or

```bash
yarn add magic-textarea
```

## Usage

The Magic Textarea has been divided into two components: BaseTextarea and MagicTextarea.

The BaseTextarea component is the foundation component that exposes a lower-level registration interface. It allows the consumer to customize the rendering content of custom strings by calling the component's registerSignalOperator method. This component also provides the ability to register custom triggers and define the entire lifecycle.

The MagicTextarea component, on the other hand, is a wrapper around the BaseTextarea component. It extends the functionality by implementing the registration of custom operators and displaying a dropdown list upon trigger activation.

Customization of Styles: You can define the style of the input box by modifying these tokens.

```css
--magic-textarea-background-color: #ffffff;
--magic-textarea-border-color: #4d7cff;
--magic-textarea-border-radius: 8px;
--magic-textarea-border-color-hover: #2254f4;
--magic-textarea-text-color-primary: #222529;
--magic-textarea-text-color-disabled: #b4b8bf;
--magic-textarea-text-color-placeholder: #9da3ac;
```

### Basic Usage

#### BaseTextarea

```vue
<template>
  <div>
    <BaseTextarea
      ref="baseTextarea"
      :content="content"
      :disabled="disabled"
      :autoFocus="autoFocus"
      :readonly="readonly"
      placeholder="输入@触发自定义操作"
      @change="handleChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { BaseTextarea } from "magic-textarea";
import { onMounted, ref } from 'vue'

const baseTextarea = ref<BaseTextarea>()
// define signal option
const signalOption = {
    type:'member',
    signal:'@',
    domClass:'member-item',
    onSignalCancel(){
      console.log('onSignalCancel')
    },
    onSignalStart(){
      console.log('onSignalStart')
    },
    onSignalInput(){
      console.log('onSignalInput')
    },
    onSignalConfirm(){
      console.log('onSignalConfirm')
    },
    onSignalKeyStroke(){
      console.log('onSignalKeyStroke')
    },
};
const handleChange = (val) => {
  console.log('content change', val)
}
onMounted(){
  // register signal operation after onMounted
  baseTextarea.registerOrUpdateSignal(signalOption)
}
</script>
```

#### MagicTextarea

```vue
<template>
  <div>
    <MagicTextarea
      :content="content"
      :disabled="disabled"
      :autoFocus="autoFocus"
      :readonly="readonly"
      :options="signalOptions"
      placeholder="输入@显示成员列表"
      @change="handleChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { MagicTextarea } from "magic-textarea";
import { onMounted } from "vue";

const generateList = (label: string, length: number) => {
  return new Array(length).fill(0).map((_cv, i) => {
    const index = i + 1;
    return {
      value: `${index}`,
      label: `${label} ${index}`,
    };
  });
};

const initRegisterOptions = [
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
];

const handleChange = (val) => {
  console.log("content change", val);
};
</script>
```

### Props

| Prop                   | Type                    | Default | Description                                   |
| ---------------------- | ----------------------- | ------- | --------------------------------------------- |
| content                | String, Number, Boolean | ''      | The init content                              |
| placeholder            | String                  | ''      | Placeholder text for the input field.         |
| disabled               | Boolean                 | false   | Whether or not the input field is disabled.   |
| readonly               | Boolean                 | false   | Is the content readonly.                      |
| options[MagicTextarea] | Array                   | []      | An array of signal options used for register. |

## Warning

The HTML content returned by this input component has not been processed in any special way. Please take appropriate site defense measures on your own.

## License

magic-textarea is licensed under the [MIT License](https://opensource.org/licenses/MIT).
