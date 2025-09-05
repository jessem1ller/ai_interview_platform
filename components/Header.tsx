"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

const Header = () => {
  const { user } = useUser();

  return (
    <header className="bg-dark-100 flex items-center justify-between p-4">
      <Link href="/">
        <h1 className="text-2xl font-bold text-white">AI Interview Platform</h1>
      </Link>
      <div>
        {user ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <Link href="/sign-in" className="text-white">Sign In</Link>
        )}
      </div>
    </header>
  );
};

export default Header;

// import Link from "next/link";
// import { UserButton } from "@clerk/nextjs";
// import { auth } from "@clerk/nextjs/server";

// import { useEffect, useState } from "react";

// const Header = () => {
//   const [userId, setUserId] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchAuth() {
//       const session = await auth();
//       setUserId(session?.userId ?? null);
//     }
//     fetchAuth();
//   }, []);

//   return (
//     <header className="bg-dark-100 flex items-center justify-between p-4">
//       <Link href="/">
//         <h1 className="text-2xl font-bold text-white">AI Interview Platform</h1>
//       </Link>
//       <div>
//         {userId ? (
//           <UserButton afterSignOutUrl="/" />
//         ) : (
//           <Link href="/sign-in" className="text-white">Sign In</Link>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Header;