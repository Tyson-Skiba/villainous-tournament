import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: 'autoUpdate',
			manifestFilename: 'manifest.json',

			manifest: {
				id: 'app.netlify.villainous-tournament',

				name: 'Villainous Tournament Round Randomiser',
				short_name: 'Villainous Tournament',
				description: 'A Disney Villainous character randomiser for game night.',

				start_url: '/',
				scope: '/',

				display: 'standalone',
				display_override: ['window-controls-overlay', 'standalone'],
				orientation: 'portrait',

				theme_color: '#111016',
				background_color: '#111016',

				lang: 'en-AU',

				categories: ['games', 'entertainment'],

				icons: [
					{
						src: 'favicon.ico',
						sizes: '64x64 32x32 24x24 16x16',
						type: 'image/x-icon',
					},
					{
						src: 'logo192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: 'logo512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: 'logo192-maskable.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'maskable',
					},
					{
						src: 'logo512-maskable.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
			},
		}),
	],
})
