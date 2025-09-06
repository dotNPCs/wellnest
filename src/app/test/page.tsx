import { api } from "@/trpc/server";
import Main from "./_components/main";

const Page = async () => {
  const pet = await api.llm.findFirstPet();

  if (!pet) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <h1 className="text-2xl font-bold">No Pets Found</h1>
        <p className="text-gray-600">
          You have no pets yet. Please create a pet to get started!
        </p>
      </div>
    );
  }

  return <Main pet={pet} />;
};

export default Page;
