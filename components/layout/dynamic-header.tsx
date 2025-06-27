import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "../ui/button";

interface DynamicHeaderProps {
  children?: React.ReactNode;
}

export default function DynamicHeader({ children }: DynamicHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex justify-between items-center p-4 gap-4 h-16 border-b border-gray-200 bg-white md:static">
      <div className="flex items-center gap-4">{children}</div>

      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton>
            <Button variant="secondary">Sign In</Button>
          </SignInButton>
          <SignUpButton>
            <Button>Sign Up</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
