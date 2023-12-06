import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // https://tailwindcss.com/docs/container#customizing
    container: {
      center: true, // container 内容默认居中
      padding: '2rem', // container 内容默认水平内边距
      // https://tailwindcss.com/docs/screens
      screens: {
        // 此次是重置container组件中2xl断点，而不是全局断点！
        '2xl': '1400px', // 重置 2xl的 min-width 为 1400px，默认为 1536px
      },
    },
    extend: {
      // https://tailwindcss.com/docs/customizing-colors
      colors: {
        primary: {
          500: '#FF7000',
          100: '#FFF1E6',
        },
        dark: {
          100: '#000000',
          200: '#0F1117',
          300: '#151821',
          400: '#212734',
          500: '#101012',
        },
        light: {
          900: '#FFFFFF',
          800: '#F4F6F8',
          850: '#FDFDFD',
          700: '#DCE3F1',
          500: '#7B8EC8',
          400: '#858EAD',
        },
        'accent-blue': '#1DA1F2',
      },
      // https://tailwindcss.com/docs/font-family#customizing-your-theme
      fontFamily: {
        inter: ['var(--font-inter)'],
        lc: ['var(--font-yzklct)'],
      },
      boxShadow: {
        'light-100':
          '0px 12px 20px 0px rgba(184, 184, 184, 0.03), 0px 6px 12px 0px rgba(184, 184, 184, 0.02), 0px 2px 4px 0px rgba(184, 184, 184, 0.03)',
        'light-200': '10px 10px 20px 0px rgba(218, 213, 213, 0.10)',
        'light-300': '-10px 10px 20px 0px rgba(218, 213, 213, 0.10)',
        'dark-100': '0px 2px 10px 0px rgba(46, 52, 56, 0.10)',
        'dark-200': '2px 0px 20px 0px rgba(39, 36, 36, 0.04)',
      },
      // https://tailwindcss.com/docs/background-image
      backgroundImage: {
        'auth-dark': "url('/assets/images/auth-dark.png')",
        'auth-light': "url('/assets/images/auth-light.png')",
      },
      //
      screens: {
        // 添加一个小尺寸屏幕，https://tailwindcss.com/docs/screens#adding-smaller-breakpoints
        xs: '420px',
        ...defaultTheme.screens, // 此处必须加入默认配置，因为xs默认会被加到最后，min-width是移动端优先，如果更小的尺寸写在更下面，将会导致小尺寸下的样式在大尺寸上依旧适用，导致意料之外的BUG
      },
      // https://tailwindcss.com/docs/animation#customizing-your-theme
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animated'),
    require('@tailwindcss/typography'),
  ],
}
export default config
