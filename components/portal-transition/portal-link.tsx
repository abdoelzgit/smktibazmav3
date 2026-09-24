"use client";

import React from "react";
import { usePortalTransition } from "./portal-transition-context";

interface PortalLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  label?: string;
  children: React.ReactNode;
}

export function PortalLink({
  href,
  label,
  children,
  onClick,
  className,
  ...props
}: PortalLinkProps) {
  const { navigateTo } = usePortalTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;

    e.preventDefault();
    const textLabel =
      label || (typeof children === "string" ? children : "SMK TI BAZMA");
    navigateTo(href, textLabel);
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}
