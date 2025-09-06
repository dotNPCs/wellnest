import type React from "react";

type Props = {
  children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
  return <div className="h-screen p-4">{children}</div>;
};

export default Layout;
