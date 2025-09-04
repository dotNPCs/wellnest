import React, { useState } from "react";
import { MEAL_CONFIG } from "@/lib/utils";
import { MealType } from "@prisma/client";
import { api } from "@/trpc/react";

interface MealCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mealType: MealType;
}

const MealCheckinModal: React.FC<MealCheckinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mealType,
}) => {
  const [rating, setRating] = useState<number>(3);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mealConfig = MEAL_CONFIG[mealType];

  const createCheckin = api.checkin.create.useMutation({
    onSuccess: () => {
      setIsSubmitting(false);
      onSuccess();
      onClose();
      // Reset form
      setRating(3);
      setNotes("");
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      console.error("Failed to create check-in:", error);
      // You might want to show a toast notification here
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    createCheckin.mutate({
      mealType,
      rating,
      notes: notes.trim() ?? undefined,
      date: new Date(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {mealConfig.emoji} {mealConfig.label} Check-in
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Rating */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              How was your {mealConfig.label.toLowerCase()}? (1-5)
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`h-10 w-10 rounded-full border-2 font-medium transition-colors ${
                    rating === value
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-300 bg-white text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you feel? What did you eat?"
              className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={3}
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-500">
              {notes.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Check-in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealCheckinModal;
