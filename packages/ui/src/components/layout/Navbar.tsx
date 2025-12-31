import React from "react";
import { ThemeTogglerButton } from "@repo/ui/components/animate-ui/components/buttons/theme-toggler.js";

type NavbarProps = {
  UserButton: React.ComponentType<any>;
};

export const Navbar = ({ UserButton }: NavbarProps) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-800 h-16">
      <div className={"ml-4 flex items-center justify-between"}>
        <h3 className={"font-medium text-2xl "}>CHATTY</h3>
      </div>
      <div className="flex items-center justify-between gap-10 mr-4">
        <ThemeTogglerButton />
        <UserButton />
      </div>
    </div>
  );
};
