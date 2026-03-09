import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

import avatar1 from "@/assets/avatars/avatar-1.png";
import avatar2 from "@/assets/avatars/avatar-2.png";
import avatar3 from "@/assets/avatars/avatar-3.png";
import avatar4 from "@/assets/avatars/avatar-4.png";
import avatar5 from "@/assets/avatars/avatar-5.png";
import avatar6 from "@/assets/avatars/avatar-6.png";
import avatar7 from "@/assets/avatars/avatar-7.png";
import avatar8 from "@/assets/avatars/avatar-8.png";

export const AVATAR_OPTIONS = [
  { id: "avatar-1", src: avatar1, label: "Student Boy" },
  { id: "avatar-2", src: avatar2, label: "Student Girl" },
  { id: "avatar-3", src: avatar3, label: "Music Lover" },
  { id: "avatar-4", src: avatar4, label: "Graduate" },
  { id: "avatar-5", src: avatar5, label: "Astronaut" },
  { id: "avatar-6", src: avatar6, label: "Ninja" },
  { id: "avatar-7", src: avatar7, label: "Scientist" },
  { id: "avatar-8", src: avatar8, label: "Engineer" },
];

export const getAvatarSrc = (avatarId: string | null | undefined): string | null => {
  if (!avatarId) return null;
  const found = AVATAR_OPTIONS.find((a) => a.id === avatarId);
  return found?.src || null;
};

interface AvatarPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar: string | null;
  onSelect: (avatarId: string) => void;
  saving?: boolean;
}

const AvatarPicker = ({ open, onOpenChange, currentAvatar, onSelect, saving }: AvatarPickerProps) => {
  const [selected, setSelected] = useState<string | null>(currentAvatar);

  const handleSave = () => {
    if (selected) onSelect(selected);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Choose Your Avatar</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-3 py-4">
          {AVATAR_OPTIONS.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              onClick={() => setSelected(avatar.id)}
              className={cn(
                "relative rounded-2xl border-2 p-1.5 transition-all hover:scale-105",
                selected === avatar.id
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border/50 bg-card hover:border-primary/40"
              )}
            >
              <img
                src={avatar.src}
                alt={avatar.label}
                className="w-full aspect-square object-cover rounded-xl"
              />
              {selected === avatar.id && (
                <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              <p className="text-[9px] text-center text-muted-foreground mt-1 truncate">{avatar.label}</p>
            </button>
          ))}
        </div>
        <Button onClick={handleSave} disabled={!selected || saving} className="w-full font-display font-semibold">
          {saving ? "Saving..." : "Set Avatar"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarPicker;
