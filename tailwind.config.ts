import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:    '#1B4D73',
        amber:   '#1B7339',
        success: '#27A85A',
        danger:  '#E24B4A',
        info:    '#185FA5',
        muted:   '#6B7280',
      },
    },
  },
  plugins: [],
};

export default config;
