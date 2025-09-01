import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import PetWrapper from "./_components/Homescreen/PetWrapper";
import CustomDrawer from "./_components/MainDrawer";
import DrawerContent from "./_components/Homescreen/DrawerContent";

export default async function Home() {
  const session = await auth();

  // if (session?.user) {
  //   void api.post.getLatest.prefetch();
  // }

  return (
    <HydrateClient>
      <main className="min-h-screen overflow-hidden bg-black">
        <PetWrapper />

        <CustomDrawer
          title="Game Menu"
          allowDragUp={true} // Set to false to disable dragging up
        >
          {/* Your drawer content goes here */}
          <DrawerContent />
        </CustomDrawer>
      </main>
    </HydrateClient>
  );
}
