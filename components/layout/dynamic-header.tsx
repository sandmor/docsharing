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
    <header className="flex justify-between items-center p-4 gap-4 h-16 border-b border-gray-200">
      <div>{children}</div>

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
