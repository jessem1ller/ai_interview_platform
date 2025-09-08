"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { signOut as firebaseClientSignOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { signOut as firebaseServerSignOut } from "@/lib/actions/auth.action";
import { useRouter } from "next/navigation";

const Header = () => {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await firebaseServerSignOut();
      await firebaseClientSignOut(auth);
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  const firstName = user?.name?.split(' ')[0];

  return (
    <header className="bg-dark-100 flex items-center justify-between p-4">
      <Link href="/">
        <h1 className="text-2xl font-bold text-white">AI Interview Platform</h1>
      </Link>
      <div className="text-white flex items-center gap-4">
        {user ? (
          <>
            <span>Hi {firstName}!</span>
            <span>|</span>
            <button onClick={handleSignOut}>Sign Out</button>
          </>
        ) : (
          <Link href="/sign-in">Sign In</Link>
        )}
      </div>
    </header>
  );
};

export default Header;