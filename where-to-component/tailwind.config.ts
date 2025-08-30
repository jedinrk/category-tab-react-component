import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'where-active': 'var(--where-color-active)',
        'where-inactive': 'var(--where-color-inactive)',
        'where-body': 'var(--where-color-body)',
        'where-divider': 'var(--where-divider)',
      },
      fontSize: {
        'where-heading-d': 'var(--where-heading-size-d)',
        'where-heading-t': 'var(--where-heading-size-t)',
        'where-heading-m': 'var(--where-heading-size-m)',
        'where-title': 'var(--where-title-size)',
        'where-body': 'var(--where-body-size)',
      },
      spacing: {
        'where-gutter-d': 'var(--where-gutter-d)',
        'where-gutter-t': 'var(--where-gutter-t)',
        'where-gutter-m': 'var(--where-gutter-m)',
      },
      animation: {
        'fade-in': 'fadeIn 280ms ease',
        'slide-up': 'slideUp 280ms ease',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
