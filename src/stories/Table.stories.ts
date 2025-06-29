"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Table from "@/components/Table";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Example/Table",
  component: Table,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: {
    tableData: [null],
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const tableData = [
  {
    rank: 1,
    badge: "Specialist Technician",
    wallet: "0x1234567890abcdef1234567890abcdef12345678",
    points: 90000,
  },
  {
    rank: 2,
    badge: "Specialist Technician",
    wallet: "0x1234567890abcdef1234567890abcdef12345678",
    points: 90000,
  },
  {
    rank: 3,
    badge: "Specialist Technician",
    wallet: "0x1234567890abcdef1234567890abcdef12345678",
    points: 90000,
  },
  {
    rank: 4,
    badge: "Specialist Technician",
    wallet: "0x1234567890abcdef1234567890abcdef12345678",
    points: 90000,
  },
  {
    rank: 5,
    badge: "Specialist Technician",
    wallet: "0x1234567890abcdef1234567890abcdef12345678",
    points: 90000,
  },
  null,
  {
    rank: 1234566,
    badge: "Specialist Technician",
    wallet: "0x1234567890abcdef1234567890abcdef12345678",
    points: 90000,
  },
  {
    rank: 1234567,
    badge: "Specialist Technician",
    wallet: "0x1234567890abcdef1234567890abcdef12345678",
    points: 90000,
    special: true,
  },
  {
    rank: 1234568,
    badge: "Specialist Technician",
    wallet: "0x1234567890abcdef1234567890abcdef12345678",
    points: 90000,
  },
];
export const Default: Story = {
  args: {
    tableData: tableData,
  },
};
