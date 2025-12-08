import type { Meta, StoryObj } from '@storybook/react-vite';
import { Mail } from 'lucide-react';
import { fn } from 'storybook/test';

import { Button } from '@/components/ui/button'; // Import từ folder component của bạn

const meta = {
  title: 'Shadcn/Button', // Đặt tên nhóm trong Sidebar
  component: Button,
  tags: ['autodocs'],
  // Layout centered giúp button nằm giữa màn hình cho dễ nhìn
  parameters: {
    layout: 'centered',
  },
  // Giả lập hành động click
  args: {
    onClick: fn(),
  },
  // Cấu hình để Storybook hiển thị Dropdown cho props
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
      description: 'Kiểu hiển thị của button',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Kích thước button',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button Mặc định',
    variant: 'default',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Xóa dữ liệu',
    variant: 'destructive',
  },
};

export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <Mail className="mr-2 h-4 w-4" /> Login with Email
    </Button>
  ),
  args: {
    variant: 'secondary',
  },
};
