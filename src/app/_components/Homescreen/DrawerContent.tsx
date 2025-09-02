"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklyCalendar from "@/app/_components/WeeklyCalendar";

const DrawerContent = () => {
  return (
    <Tabs defaultValue="diary" className="w-full">
      <TabsList className="font-pixel mx-auto mb-4 flex bg-transparent">
        <TabsTrigger
          value="diary"
          className="flex-1 text-slate-400 transition-all data-[state=active]:text-[1.01rem] data-[state=active]:text-black data-[state=active]:shadow-none"
        >
          diary
        </TabsTrigger>

        <TabsTrigger
          value="activities"
          className="flex-1 rounded-none border-x border-y-0! border-slate-300 text-slate-400 transition-all data-[state=active]:text-[1.01rem] data-[state=active]:text-black data-[state=active]:shadow-none"
        >
          activities
        </TabsTrigger>

        <TabsTrigger
          value="farm"
          className="flex-1 text-slate-400 data-[state=active]:text-[1.01rem] data-[state=active]:text-black data-[state=active]:shadow-none"
        >
          farm
        </TabsTrigger>
      </TabsList>

      <TabsContent value="diary" >
          <WeeklyCalendar />
      </TabsContent>
      <TabsContent value="activities">activities</TabsContent>
      <TabsContent value="farm">farm</TabsContent>
    </Tabs>
  );
};
export default DrawerContent;
