import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
const en = defineConfig({
	lang: "en-US",
	description: "Patterns and programming techniques",

	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [],

		sidebar: [],

		editLink: {
			pattern: "https://github.com/SX-3/sxcode/edit/main/docs/:path",
		},

		footer: {
			copyright: "© 2024 – present, SX3",
		},
	},
});

export { en };
