import Link from "next/link";
import type { GetServerSideProps } from "next";

type Props = {
  user?: { id: number; username: string; email: string };
};

export default function Dashboard({ user }: Props) {
  if (!user) {
    return (
      <div className="p-6">
        <p>
          You’re not logged in.{" "}
          <Link className="text-blue-600 underline" href="/login">
            Go to login
          </Link>
        </p>
      </div>
    );
  }

  const doLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Welcome, {user.username}</h1>
      <button onClick={doLogout} className="mt-4 px-4 py-2 bg-gray-900 text-white rounded">
        Log out
      </button>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const base = process.env.NEXT_PUBLIC_BASE_ORIGIN || "http://localhost:3000";

  const me = await fetch(`${base}/api/me`, {
    headers: { cookie: ctx.req.headers.cookie || "" },
  });

  if (me.status === 200) {
    const j = await me.json();
    return { props: { user: j.user } };
  }

  // Not authenticated → redirect to login with ?next=
  return {
    redirect: {
      destination: `/login?next=${encodeURIComponent(ctx.resolvedUrl)}`,
      permanent: false,
    },
  };
};
