import { motion } from "framer-motion";
import { blurTransition } from "@/lib/transitions";

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.main
      variants={blurTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-[40vh]"
    >
      {children}
    </motion.main>
  );
}
