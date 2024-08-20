import { defineConfig } from "vitepress";
import { shared } from "./shared";
import { ru } from "./ru";
import { en } from "./en";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	...shared,
	locales: {
		root: { label: "English", ...en },
		ru: { label: "Русский", ...ru },
	},
});
