import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        warning: '#f59e0b',
        danger: '#ef4444',
        success: '#10b981'
      }
    }
  },
  plugins: []
};

export default config;
