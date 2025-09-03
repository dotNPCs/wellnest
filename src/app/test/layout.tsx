import { api } from "@/trpc/server";
import Page from "./page";
import type React from "react";

const Layout = async () => {
  const pet = await api.llm.findFirstPet();

  return (
    <div className="p-4">
      <Page pet={pet} />
    </div>
  );
};

export default Layout;
