import { defineConfig } from "vitepress";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";

const shared = defineConfig({
	title: "SX Code",
	//base: "/sxcode",
	rewrites: {
		"en/:rest*": ":rest*",
	},
	themeConfig: {
		socialLinks: [{ icon: "github", link: "https://github.com/SX-3/sxcode" }],
		search: {
			provider: "local",
			options: {
				locales: {
					ru: {
						translations: {
							button: {
								buttonText: "Поиск",
								buttonAriaLabel: "Поиск",
							},
							modal: {
								displayDetails: "Показать подробный список",
								resetButtonTitle: "Сбросить поиск",
								backButtonTitle: "Закрыть поиск",
								noResultsText: "Нет результатов",
								footer: {
									selectText: "Выбрать",
									selectKeyAriaLabel: "Enter",
									navigateText: "Навигация",
									navigateUpKeyAriaLabel: "Стрелка вверх",
									navigateDownKeyAriaLabel: "Стрелка вниз",
									closeText: "Закрыть",
									closeKeyAriaLabel: "Esc",
								},
							},
						},
					},
				},
			},
		},
	},
	markdown: {
		codeTransformers: [transformerTwoslash()],
	},
	lastUpdated: true,
});

export { shared };
