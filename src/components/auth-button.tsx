// social-network\src\components\auth-button.tsx

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import React from "react";

const AuthButton = () => {
  return (
    <header className="flex items-center justify-center">
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
};

export default AuthButton;
