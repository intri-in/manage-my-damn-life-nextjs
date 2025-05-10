// import the original type declarations
import "i18next";
// import all namespaces (for the default language, only)
import ns1 from "locales/en/ns1.json";
import ns2 from "locales/en/ns2.json";

declare module "i18next" {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    returnNull: false
}
}