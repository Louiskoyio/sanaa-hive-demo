import type { Variants } from "framer-motion";

export const blurTransition: Variants = {
  initial: {
    opacity: 0,
    y: 8,
    filter: "blur(6px) saturate(115%)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px) saturate(100%)",
    transition: { duration: 0.45, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(6px) saturate(115%)",
    transition: { duration: 0.30, ease: "easeIn" },
  },
};
