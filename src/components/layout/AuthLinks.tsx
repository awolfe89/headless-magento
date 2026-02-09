"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { CUSTOMER_QUERY } from "@/lib/graphql/queries/customer";
import { isLoggedIn } from "@/lib/auth/token";
import { revokeAndClear } from "@/lib/auth/logout";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function AuthLinks() {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoggedIn(isLoggedIn());

    function onAuthChange() {
      setLoggedIn(isLoggedIn());
    }
    window.addEventListener("auth-change", onAuthChange);
    return () => window.removeEventListener("auth-change", onAuthChange);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = useQuery<any>(CUSTOMER_QUERY, {
    skip: !loggedIn,
    fetchPolicy: "cache-first",
  });

  const firstname = data?.customer?.firstname;

  function handleLogout() {
    revokeAndClear().then(() => {
      setLoggedIn(false);
      router.push("/");
      router.refresh();
    });
  }

  if (!loggedIn) {
    return (
      <>
        <Link href="/customer/login" className="transition hover:text-white">
          Sign In
        </Link>
        <span className="text-gray-600">|</span>
        <Link href="/customer/login" className="transition hover:text-white">
          Create an Account
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/account"
        className="flex items-center gap-1.5 transition hover:text-white"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
          {firstname ? firstname.charAt(0).toUpperCase() : "U"}
        </span>
        <span className="max-w-[120px] truncate">
          {firstname ? `Hi, ${firstname}` : "My Account"}
        </span>
      </Link>
      <span className="text-gray-600">|</span>
      <Link href="/account" className="transition hover:text-white">
        Account
      </Link>
      <span className="text-gray-600">|</span>
      <button
        onClick={handleLogout}
        className="transition hover:text-white"
      >
        Sign Out
      </button>
    </>
  );
}
