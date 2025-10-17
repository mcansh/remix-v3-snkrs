import type { Config } from "prettier";

export default {
  plugins: ["prettier-plugin-organize-imports", "prettier-plugin-tailwindcss"],
  semi: false,
  useTabs: true,
} satisfies Config;
