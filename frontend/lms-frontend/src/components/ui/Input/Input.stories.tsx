import type { Meta, StoryObj } from "@storybook/react-vite"
import Input from "./Input"

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
}

export default meta

type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: "Enter username"
  },
}

export const Password: Story = {
  args: {
    placeholder: "Enter password",
    type: "password"
  }
}
