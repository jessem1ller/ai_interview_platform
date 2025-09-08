"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/client";

const Header = () => {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-dark-100 flex items-center justify-between p-4">
      <Link href="/">
        <h1 className="text-2xl font-bold text-white">AI Interview Platform</h1>
      </Link>
      <div className="text-white flex items-center gap-4">
        {user ? (
          <>
            <span>{user.displayName || user.email}</span>
            <span>|</span>
            <button onClick={handleSignOut}>Sign Out</button>
          </>
        ) : (
          null
        )}
      </div>
    </header>
  );
};

export default Header;