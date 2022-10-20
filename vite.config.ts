import { defineConfig } from 'vite'  

export default ({ command, mode }) => {
	 
	return defineConfig({
		plugins: [ ],

		optimizeDeps: {
			/** vite >= 2.3.0 */
			// esbuildOptions: {
			// 	plugins: [
			// 		esbuildPluginMonacoEditorNls({
			// 			locale: Languages.zh_hans,
			// 		}),
			// 	],
			// },
			include: []
		},
		server: {
			host: process.env.VITE_HOST,
			port: Number(process.env.VITE_PORT) || 9999,
			// 是否自动在浏览器打开
			open: true,
			// 是否开启 https
			https: false,
			base: process.env.VITE_BASE_URL,
		},
		build: {
			// 服务端渲染
			ssr: false,
			//    sourcemap:true,
			outDir: process.env.VITE_OUTPUT_DIR,

			rollupOptions: {
				input: {
					index: './index.html', 
				},
				 
			}
		},
		define: {
			'process.env': {}
		},

	})
}
