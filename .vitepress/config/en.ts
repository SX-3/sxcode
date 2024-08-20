import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
const en = defineConfig({
	lang: "en-US",
	description: "Patterns and programming techniques",

	themeConfig: {
		nav: [
			{
				text: "Patterns",
				link: "/ru/patterns/composite-proxy",
			},
		],

		sidebar: [
			{
				text: "Patterns",
				items: [{ text: "Composite proxy", link: "/patterns/composite-proxy" }],
			},
		],

		editLink: {
			pattern: "https://github.com/SX-3/sxcode/edit/main/docs/:path",
		},

		footer: {
			copyright: "© 2024 – present, SX3",
		},
	},
});

export { en };
