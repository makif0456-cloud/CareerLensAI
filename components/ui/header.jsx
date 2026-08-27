import React from "react";
import { Button } from "./button";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
  ChevronDown,
  StarsIcon,
} from "lucide-react";
import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { checkUser } from "@/lib/checkUser";
import { ThemeToggle } from "./theme-toggle";

export default async function Header() {
  await checkUser();

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="CareerLensai Logo"
            width={200}
            height={60}
            className="h-12 py-1 w-auto object-contain"
          />
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 md:space-x-4">

          {/* Dark / Light Mode */}
          <ThemeToggle />

          {/* Signed-in users */}
          <Show when="signed-in">
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="hidden md:inline-flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Industry Insights
              </Button>

              <Button
                variant="ghost"
                className="md:hidden w-10 h-10 p-0"
              >
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            </Link>

            {/* Growth Tools Dropdown */}
            {/* Growth Tools Dropdown */}
{/* Growth Tools Dropdown */}
<DropdownMenu>
  <DropdownMenuTrigger
    render={
      <Button className="flex items-center gap-2" />
    }
  >
    <StarsIcon className="h-4 w-4" />
    <span className="hidden md:block">Growth Tools</span>
    <ChevronDown className="h-4 w-4" />
  </DropdownMenuTrigger>

  <DropdownMenuContent align="end" className="w-48">

    <DropdownMenuItem
      render={
        <Link href="/resume" className="flex items-center gap-2" />
      }
    >
      <FileText className="h-4 w-4" />
      Build Resume
    </DropdownMenuItem>

    <DropdownMenuItem
      render={
        <Link
          href="/ai-cover-letter"
          className="flex items-center gap-2"
        />
      }
    >
      <PenBox className="h-4 w-4" />
      Cover Letter
    </DropdownMenuItem>

    <DropdownMenuItem
      render={
        <Link
          href="/interview"
          className="flex items-center gap-2"
        />
      }
    >
      <GraduationCap className="h-4 w-4" />
      Interview Prep
    </DropdownMenuItem>

  </DropdownMenuContent>
</DropdownMenu>
          </Show>

          {/* Signed-out users */}
          <Show when="signed-out">
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </Show>

          {/* User profile */}
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "shadow-xl",
                  userPreviewMainIdentifier: "font-semibold",
                },
              }}
            />
          </Show>

        </div>
      </nav>
    </header>
  );
}