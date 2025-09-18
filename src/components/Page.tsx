// components/Page.tsx
import { useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { blurTransition } from "@/lib/transitions";

type Props = {
  children: React.ReactNode;
  /** Optional page label. If omitted, a name is derived from the route. */
  title?: string;
};

function capitalizeWords(s: string) {
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function deriveTitleFromPath(pathname: string) {
  if (!pathname || pathname === "/") return "Home";
  // take the first non-empty segment for a clean label (e.g., "/events/[slug]" -> "Events")
  const first = pathname.split("/").filter(Boolean)[0] || "";
  return capitalizeWords(first.replace(/[-_]+/g, " "));
}

export default function Page({ children, title }: Props) {
  const router = useRouter();

  const pageLabel = useMemo(
    () => title?.trim() || deriveTitleFromPath(router.pathname),
    [title, router.pathname]
  );

  const fullTitle = useMemo(
    () => (pageLabel ? `Sanaa Hive | ${pageLabel}` : "Sanaa Hive"),
    [pageLabel]
  );

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta property="og:title" content={fullTitle} />
      </Head>

      <motion.main
        variants={blurTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-[40vh]"
      >
        {children}
      </motion.main>
    </>
  );
}
