import { sileo } from "sileo";

function opts(title: string, description?: string) {
  return description ? { title, description } : { title };
}

/**
 * App-wide notifications via [Sileo](https://sileo.aaryan.design/).
 * String-first API matches prior `sonner` usage in this codebase.
 */
export const toast = {
  success: (message: string, description?: string) => {
    sileo.success(opts(message, description));
  },
  error: (message: string, description?: string) => {
    sileo.error(opts(message, description));
  },
  info: (message: string, description?: string) => {
    sileo.info(opts(message, description));
  },
  warning: (message: string, description?: string) => {
    sileo.warning(opts(message, description));
  },
};

export { sileo };
