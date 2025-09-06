// pages/_app.tsx
import type { AppContext, AppProps } from "next/app";
import "@/styles/globals.css";
import { AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";

type SessionUser = { id: number; username: string; email: string } | null;

function MyApp({ Component, pageProps }: AppProps & { pageProps: { _user?: SessionUser } }) {
  const router = useRouter();
  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait" initial onExitComplete={() => window.scrollTo(0, 0)}>
        <Layout user={pageProps._user ?? null}>
          <Component key={router.asPath} {...pageProps} />
        </Layout>
      </AnimatePresence>
    </LazyMotion>
  );
}

MyApp.getInitialProps = async (appCtx: AppContext) => {
  const { Component, ctx } = appCtx;

  // Preserve any page-level getInitialProps
  let pageProps: any = {};
  if ((Component as any).getInitialProps) {
    pageProps = await (Component as any).getInitialProps(ctx);
  }

  // Fetch session user from your own Next API using the incoming cookies
  let _user: SessionUser = null;
  try {
    const base = process.env.NEXT_PUBLIC_BASE_ORIGIN || "http://localhost:3000";
    const me = await fetch(`${base}/api/me`, {
      headers: { cookie: ctx.req?.headers.cookie || "" },
    });
    if (me.ok) {
      const j = await me.json();
      _user = j?.user ?? null;
    }
  } catch {
    _user = null;
  }

  return { pageProps: { ...pageProps, _user } };
};

export default MyApp;
