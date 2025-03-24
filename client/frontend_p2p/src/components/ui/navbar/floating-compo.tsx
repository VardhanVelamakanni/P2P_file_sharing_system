// SidebarDemo.tsx
"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./slidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconBulb,
  IconHistory,
  IconSettings,
  IconShare,
  IconTransfer,
  IconUserBolt,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { cn } from "../../../lib/utils";

export function SidebarDemo() {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Share", href: "#", icon: <IconTransfer className="h-5 w-5" /> },
    { label: "History", href: "#", icon: <IconHistory className="h-5 w-5" /> },
    { label: "About", href: "#", icon: <IconBulb className="h-5 w-5" /> },
    { label: "Logout", href: "#", icon: <IconArrowLeft className="h-5 w-5" /> },
  ];

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-in-out bg-black bg-opacity-70 text-white",
        open ? "w-64" : "w-16"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="flex flex-col justify-between h-full p-4">
          <div className="space-y-4">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
          <SidebarLink
            link={{
              label: "Login",
              href: "#",
              icon: (
                <img
                  src="/assets/account.png"
                  className="h-7 w-7 rounded-full"
                  alt="Avatar"
                />
              ),
            }}
          />
        </SidebarBody>
      </Sidebar>
    </div>
  );
}
