import { nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { checkLogin_InBuilt } from "../user";

export function useAuthGuard(redirectPath: string, nextAuthEnabledFromProps?: boolean): boolean | null {
  const { status } = useSession();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();
  const routerRef = useRef(router);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth(): Promise<void> {
      const isNextAuthEnabled = nextAuthEnabledFromProps ?? await nextAuthEnabled()
      if (isNextAuthEnabled) {
        if (status === "unauthenticated") {
          signIn();
        } else if (isMounted) {
          setIsLoggedIn(status === "authenticated");
        }
      } else {
        const loggedIn = await checkLogin_InBuilt(routerRef.current, redirectPath);
        if (isMounted) setIsLoggedIn(loggedIn as boolean);
      }
    }

    if (status !== "loading") {
      checkAuth();
    }

    return () => {
      isMounted = false;
    };
  }, [status, redirectPath]);

  return isLoggedIn;
}