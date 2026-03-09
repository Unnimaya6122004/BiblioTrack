import type { Meta, StoryObj } from "@storybook/react-vite"
import Button from "./Button"

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    children: "Primary Button"
  },
}

export const Secondary: Story = {
  args: {
    children: "Secondary Button",
    className: "bg-gray-700 hover:bg-gray-800"
  },
}

export const Danger: Story = {
  args: {
    children: "Delete Button",
    className: "bg-red-600 hover:bg-red-700"
  },
}
