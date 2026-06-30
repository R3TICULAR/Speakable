import type { Meta, StoryObj } from '@storybook/html';
import { createMultiSelect, type MultiSelectProps } from './MultiSelect';

const meta: Meta<MultiSelectProps> = {
  title: 'Components/MultiSelect',
  tags: ['autodocs'],
  render: (args) => createMultiSelect(args),
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<MultiSelectProps>;

/**
 * Default multi-select with programming language options.
 * Demonstrates full keyboard navigation and ARIA listbox pattern.
 */
export const Default: Story = {
  args: {
    label: 'Programming Languages',
    placeholder: 'Choose languages...',
    options: [
      { id: 'js', label: 'JavaScript' },
      { id: 'ts', label: 'TypeScript' },
      { id: 'py', label: 'Python' },
      { id: 'rs', label: 'Rust' },
      { id: 'go', label: 'Go' },
      { id: 'rb', label: 'Ruby' },
    ],
    selected: [],
  },
};

/**
 * Multi-select with some options pre-selected.
 * Screen readers should announce "2 selected" on the trigger.
 */
export const WithPreselection: Story = {
  args: {
    label: 'Notification Channels',
    placeholder: 'Select channels...',
    options: [
      { id: 'email', label: 'Email' },
      { id: 'sms', label: 'SMS' },
      { id: 'push', label: 'Push Notifications' },
      { id: 'slack', label: 'Slack' },
      { id: 'webhook', label: 'Webhook' },
    ],
    selected: ['email', 'slack'],
  },
};

/**
 * Multi-select with disabled options.
 * Screen readers should announce aria-disabled state.
 */
export const WithDisabledOptions: Story = {
  args: {
    label: 'Deployment Targets',
    placeholder: 'Select targets...',
    options: [
      { id: 'prod', label: 'Production' },
      { id: 'staging', label: 'Staging' },
      { id: 'dev', label: 'Development' },
      { id: 'preview', label: 'Preview (unavailable)', disabled: true },
      { id: 'canary', label: 'Canary (unavailable)', disabled: true },
    ],
    selected: [],
  },
};

/**
 * Multi-select with many options to test scrolling behavior.
 * Verifies aria-activedescendant tracking during scroll.
 */
export const ManyOptions: Story = {
  args: {
    label: 'Country',
    placeholder: 'Select countries...',
    options: [
      { id: 'us', label: 'United States' },
      { id: 'ca', label: 'Canada' },
      { id: 'mx', label: 'Mexico' },
      { id: 'uk', label: 'United Kingdom' },
      { id: 'de', label: 'Germany' },
      { id: 'fr', label: 'France' },
      { id: 'jp', label: 'Japan' },
      { id: 'kr', label: 'South Korea' },
      { id: 'au', label: 'Australia' },
      { id: 'br', label: 'Brazil' },
      { id: 'in', label: 'India' },
      { id: 'ng', label: 'Nigeria' },
    ],
    selected: [],
  },
};
