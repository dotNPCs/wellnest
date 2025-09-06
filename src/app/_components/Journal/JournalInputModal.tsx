import { useState, useEffect } from "react";
import { format } from "date-fns";
import { type JournalEntry } from "@prisma/client";
import { UserMood } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePet } from "@/contexts/PetContext";
import { api } from "@/trpc/react";
import Image from "next/image";

interface MoodOption {
  emoji: string;
  label: string;
  value: string;
}

interface DiaryInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  onSave: (content: string, mood?: UserMood) => Promise<void>;
  existingEntries: JournalEntry[];
  isLoading?: boolean;
  moods: MoodOption[];
}

const DiaryInputDialog = ({
  open,
  onOpenChange,
  selectedDate,
  onSave,
  existingEntries,
  isLoading = false,
  moods,
}: DiaryInputDialogProps) => {
  const [currentDiaryText, setCurrentDiaryText] = useState("");
  const [selectedMoodIndex, setSelectedMoodIndex] = useState<number | null>(
    null,
  );

  const { refetch } = usePet();
  const updatePetMoodLog = api.llm.createPetMoodLogRecord.useMutation({});

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setCurrentDiaryText("");
      setSelectedMoodIndex(null);
    }
  }, [open]);

  const handleSave = async () => {
    if (!selectedDate || !currentDiaryText.trim()) return;

    const moodValue =
      selectedMoodIndex !== null
        ? (moods[selectedMoodIndex]?.value as UserMood)
        : undefined;

    try {
      await onSave(currentDiaryText.trim(), moodValue);
      updatePetMoodLog.mutate();
      refetch();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save diary entry:", error);
    }
  };

  const formatTime = (date: Date): string => {
    return format(date, "h:mm a");
  };

  if (!selectedDate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="mx-auto rounded-2xl p-4"
        style={{
          backgroundColor: "#FCFAEE",
          border: "2px solid #A5B68D50",
        }}
      >
        <DialogHeader>
          <DialogTitle
            className="mb-1 text-base font-bold"
            style={{ color: "#5A6B4D" }}
          >
            Add Entry -{" "}
            {selectedDate.toLocaleDateString("en", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </DialogTitle>
          <p
            className="mb-3 text-xs"
            style={{ color: "#5A6B4D", opacity: 0.7 }}
          >
            {formatTime(new Date())}
          </p>
        </DialogHeader>

        {/* Mood Selection */}
        <div className="mb-3">
          <p className="mb-2 text-sm font-medium" style={{ color: "#5A6B4D" }}>
            How are you feeling?
          </p>
          <div className="grid grid-cols-5 gap-2">
            {moods.map((mood, index) => (
              <button
                key={index}
                onClick={() => setSelectedMoodIndex(index)}
                className={`flex flex-col items-center rounded-lg p-2 transition-all ${
                  selectedMoodIndex === index
                    ? "scale-110 shadow-md"
                    : "hover:opacity-80"
                }`}
                style={
                  selectedMoodIndex === index
                    ? {
                        backgroundColor: "#F4DCC9",
                        boxShadow: "0 0 0 2px #DA8359",
                      }
                    : { backgroundColor: "white" }
                }
              >
                <Image
                  src={mood.emoji || "/emojis/neutral.png"}
                  alt="Mood Emoji"
                  width={24}
                  height={24}
                />
                <div className="mt-1 text-[8px] font-medium">{mood.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Show existing entries for this day */}
        {existingEntries.length > 0 && (
          <div
            className="mb-3 max-h-32 overflow-y-auto pt-2"
            style={{ borderTop: "2px solid #A5B68D50" }}
          >
            <p
              className="mb-1 text-xs font-medium"
              style={{ color: "#5A6B4D" }}
            >
              Today&apos;s entries:
            </p>
            {existingEntries.map((entry) => (
              <div key={entry.id} className="mb-1 rounded bg-white p-2 text-xs">
                <span className="font-bold" style={{ color: "#5A6B4D" }}>
                  {formatTime(entry.createdAt)}
                </span>
                <span
                  className="ml-2"
                  style={{ color: "#5A6B4D", opacity: 0.8 }}
                >
                  {entry.content.substring(0, 50)}
                  {entry.content.length > 50 ? "..." : ""}
                </span>
              </div>
            ))}
          </div>
        )}

        <textarea
          value={currentDiaryText}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 500) {
              setCurrentDiaryText(value);
            }
          }}
          placeholder="How was your day? ✨"
          className="h-24 w-full resize-none rounded-lg bg-white p-2 text-sm focus:outline-none"
          style={{ border: "2px solid #A5B68D50" }}
        />

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#DA8359" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !currentDiaryText.trim()}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#A5B68D" }}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiaryInputDialog;
