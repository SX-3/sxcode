import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
const ru = defineConfig({
	description: "Паттерны и техники программирования",
	lang: "ru-RU",
	themeConfig: {
		nav: [
			{
				text: "Паттерны",
				link: "/ru/patterns/composite-proxy",
			},
		],

		sidebar: [
			{
				base: "/ru",
				text: "Паттерны",
				items: [
					{ text: "Композитный прокси", link: "/patterns/composite-proxy" },
				],
			},
		],

		editLink: {
			pattern: "https://github.com/SX-3/sxcode/edit/main/docs/:path",
			text: "Редактировать страницу",
		},

		footer: {
			copyright: "© 2024 – настоящее время, SX3",
		},

		outline: { label: "Содержание страницы" },

		docFooter: {
			prev: "Предыдущая страница",
			next: "Следующая страница",
		},

		lastUpdated: {
			text: "Обновлено",
		},

		darkModeSwitchLabel: "Оформление",
		lightModeSwitchTitle: "Переключить на светлую тему",
		darkModeSwitchTitle: "Переключить на тёмную тему",
		sidebarMenuLabel: "Меню",
		returnToTopLabel: "Вернуться к началу",
		langMenuLabel: "Изменить язык",
	},
});

export { ru };
