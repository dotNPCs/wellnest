"use client";

import { useEffect, useRef } from "react";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreatePetModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function CreatePetModal({
  isOpen,
  onClose,
}: CreatePetModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>You&apos;ve got a new visitor!</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
