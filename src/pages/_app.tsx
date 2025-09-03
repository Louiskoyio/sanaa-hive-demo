import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <LazyMotion features={domAnimation}>
      {/* Want first-load animation? keep "initial" (true). */}
      <AnimatePresence mode="wait" initial onExitComplete={() => window.scrollTo(0, 0)}>
        <Layout>
          {/* key on route so exit/enter fires on navigation */}
          <Component key={router.asPath} {...pageProps} />
        </Layout>
      </AnimatePresence>
    </LazyMotion>
  );
}
