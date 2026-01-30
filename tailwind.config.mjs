/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class', // Activado manualmente por el usuario
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: '#C5A059', // Gold (CTAs) [cite: 68]
					hover: '#B08D4B',   // Gold ligeramente más oscuro para hover
				},
				surface: {
					light: '#FFFFFF',   // [cite: 70]
					dark: '#0F0F0F',    // [cite: 73]
					card: '#1A1A1A',    // [cite: 74]
				},
				text: {
					main: '#121212',    // Charcoal [cite: 71]
					inverted: '#FFFFFF'
				},
				status: {
					success: '#10B981', // [cite: 75]
					error: '#F43F5E',   // [cite: 75]
				}
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],           // Body [cite: 78]
				serif: ['Playfair Display', 'serif'],    // Headings [cite: 77]
			},
		},
	},
	plugins: [],
}