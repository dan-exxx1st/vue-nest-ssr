import { h } from "vue";

const isBrowser = typeof window !== "undefined";

export default {
  setup(props, { slots }) {
    const slot = slots.default ? slots.default() : [];
    return () => (isBrowser ? h("div", {}, [slot]) : h("div"));
  },
};
