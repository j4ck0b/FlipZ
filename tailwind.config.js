import tailwindAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			DEFAULT: "0.125rem",
  			sm: "0.25rem",
  			md: "0.375rem",
  			lg: "0.5rem",
  			xl: "0.75rem",
  			'2xl': "1rem",
  			'3xl': "1.5rem",
  			full: "9999px"
  		},
  		colors: {
  			surface: "#f7f9fb",
  			"surface-dim": "#d8dadc",
  			"surface-bright": "#f7f9fb",
  			"surface-container-lowest": "#ffffff",
  			"surface-container-low": "#f2f4f6",
  			"surface-container": "#eceef0",
  			"surface-container-high": "#e6e8ea",
  			"surface-container-highest": "#e0e3e5",
  			"surface-variant": "#e0e3e5",
  			"on-surface": "#191c1e",
  			"on-surface-variant": "#44474d",
  			"inverse-surface": "#2d3133",
  			"inverse-on-surface": "#eff1f3",
  			
  			primary: {
  				DEFAULT: "#000000",
  				container: "#0d1c32",
  				fixed: "#d6e3ff",
  				"fixed-dim": "#b9c7e4"
  			},
  			"on-primary": "#ffffff",
  			"on-primary-container": "#76849f",
  			"on-primary-fixed": "#0d1c32",
  			"on-primary-fixed-variant": "#39475f",
  			
  			secondary: {
  				DEFAULT: "#3755c3",
  				container: "#708cfd",
  				fixed: "#dde1ff",
  				"fixed-dim": "#b8c4ff"
  			},
  			"on-secondary": "#ffffff",
  			"on-secondary-container": "#00217a",
  			"on-secondary-fixed": "#001453",
  			"on-secondary-fixed-variant": "#173bab",

  			tertiary: {
  				DEFAULT: "#000000",
  				container: "#0b1c30",
  				fixed: "#d3e4fe",
  				"fixed-dim": "#b7c8e1"
  			},
  			"on-tertiary": "#ffffff",
  			"on-tertiary-container": "#75859d",

  			outline: "#75777e",
  			"outline-variant": "#c5c6cd",
  			error: "#ba1a1a",
  			"on-error": "#ffffff",
  			"error-container": "#ffdad6",
  			"on-error-container": "#93000a",

  			background: '#f7f9fb',
  			foreground: '#191c1e',
  			border: '#c5c6cd',
  		},
  		fontFamily: {
  			sans: ['Inter', 'sans-serif'],
  			'headline-xl': ['Inter', 'sans-serif'],
  			'headline-lg': ['Inter', 'sans-serif'],
  			'title-md': ['Inter', 'sans-serif'],
  			'body-lg': ['Inter', 'sans-serif'],
  			'body-md': ['Inter', 'sans-serif'],
  			'body-sm': ['Inter', 'sans-serif'],
  			'label-md': ['Inter', 'sans-serif'],
  			'code-mono': ['JetBrains Mono', 'monospace'],
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			scroll: {
  				'0%': { transform: 'translateX(0)' },
  				'100%': { transform: 'translateX(calc(-50% - 12px))' }
  			},
  			progress: {
  				'0%': { backgroundPosition: '0 0' },
  				'100%': { backgroundPosition: '20px 0' }
  			},
  			fillLine: {
  				'0%': { transform: 'scaleX(0)', opacity: '0' },
  				'10%': { opacity: '1' },
  				'90%': { opacity: '1' },
  				'100%': { transform: 'scaleX(1)', opacity: '0' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'scroll-marquee': 'scroll 35s linear infinite',
  			'progress-stripe': 'progress 1s linear infinite',
  			'fill-line': 'fillLine 3s ease-in-out infinite'
  		}
  	}
  },
  plugins: [tailwindAnimate],
}
