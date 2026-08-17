import type { StorybookConfig } from '@storybook/html-vite';
import { dirname, join } from 'path';

function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|ts)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    getAbsolutePath('../addon-speakable'),
  ],
  framework: '@storybook/html-vite',
};

export default config;
