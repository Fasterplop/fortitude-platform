/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class', // Activado manualmente por el usuario
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: '#C5A059', // Gold (CTAs)
					hover: '#B08D4B',   // Gold ligeramente más oscuro para hover
				},
				surface: {
					light: '#FFFFFF',   //
					dark: '#0F0F0F',    //
					card: '#1A1A1A',    //
				},
				text: {
					main: '#121212',    // Charcoal
					inverted: '#FFFFFF'
				},
				status: {
					success: '#10B981', //
					error: '#F43F5E',   //
				}
			},
			fontFamily: {
                // CAMBIO: Estilo Geico/TheGeneral
				sans: ['Lato', 'sans-serif'],           // Body (Limpio, legible como The General)
				serif: ['Montserrat', 'sans-serif'],    // Headings (Geométrico, fuerte como Geico)
			},
		},
	},
	plugins: [],
}