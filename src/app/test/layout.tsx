import type React from "react";
import { api } from "@/trpc/server";
import Page from "./page";

const Layout = async () => {
  const pet = await api.llm.findFirstPet();

  return (
    <div className="h-screen p-4">
      <Page pet={pet} />
    </div>
  );
};

export default Layout;
