import { defineConfig } from "cypress";

export default defineConfig({
  
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },

  e2e: {
    baseUrl:process.env.NEXT_PUBLIC_BASE_URL,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
