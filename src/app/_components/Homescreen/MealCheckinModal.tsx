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
        notes: notes.trim() || undefined, // no HTML escaping needed
        date: new Date(),
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-[#402e1a]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal with animation-ready styles */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-gradient-to-br from-white via-[#fdfcf8] to-[#e1db92]/20 shadow-2xl transition-all">
        {/* Decorative header background */}
        <div className="absolute left-0 right-0 top-0 h-32 bg-gradient-to-br from-[#d7a43f]/10 to-transparent" />

        <div className="relative p-6">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-[#402e1a]">
                <span className="text-3xl">{mealConfig.emoji}</span>
                {mealConfig.label} Check-in
              </h2>
              <p className="mt-1 text-sm text-[#6a5a43]">
                Record your meal experience
              </p>
            </div>
            <button
              onClick={onClose}
              className="group rounded-lg p-1 transition-all hover:bg-[#e1db92]/50"
              aria-label="Close modal"
            >
              <svg
                className="h-6 w-6 text-[#6a5a43] transition-transform group-hover:rotate-90 group-hover:text-[#402e1a]"
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
            {/* Rating Section */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-semibold text-[#402e1a]">
                How was your {mealConfig.label.toLowerCase()}?
              </label>
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`group relative h-12 w-12 transform rounded-xl border-2 font-semibold shadow-md transition-all hover:scale-110 ${
                      rating === value
                        ? "border-[#d7a43f] bg-gradient-to-br from-[#d7a43f] to-[#c4932e] text-white shadow-lg shadow-[#d7a43f]/30"
                        : "border-[#e1db92] bg-white text-[#6a5a43] hover:border-[#d7a43f]/50 hover:shadow-lg"
                    }`}
                  >
                    <span className="relative z-10">{value}</span>
                    {rating === value && (
                      <div className="absolute inset-0 rounded-xl bg-white/20" />
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-[#6a5a43]">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Notes Section */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-[#402e1a]">
                Notes
                <span className="ml-1 font-normal text-[#6a5a43]">(optional)</span>
              </label>
              <div className="relative">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did you feel? What did you eat?"
                  className="w-full resize-none rounded-xl border-2 border-[#e1db92] bg-white/80 px-4 py-3 text-[#402e1a] placeholder-[#6a5a43]/50 shadow-inner transition-all focus:border-[#d7a43f] focus:bg-white focus:shadow-md focus:outline-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-[#6a5a43]">
                  {notes.length}/500
                </div>
              </div>
              {notes.length > 400 && (
                <p className="mt-1 text-xs font-medium text-[#d7a43f]">
                  {500 - notes.length} characters remaining
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border-2 border-[#e1db92] bg-white px-4 py-3 font-semibold text-[#6a5a43] shadow-md transition-all hover:border-[#6a5a43] hover:bg-[#e1db92]/20 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-[#6a5a43] to-[#7a6a53] px-4 py-3 font-semibold text-white shadow-lg shadow-[#6a5a43]/20 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
              >
                <span className="relative z-10">
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Save Check-in
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </span>
                {!isSubmitting && (
                  <div className="absolute inset-0 bg-white/20 transition-transform duration-300 ease-out translate-x-[-100%] group-hover:translate-x-[100%]" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MealCheckinModal;