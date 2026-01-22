import { create } from "zustand";

type PresenceState = {
    presence: Record<string, "online" | "offline">;
    setPresence: (userId: string, status: "online" | "offline") => void;
};

export const usePresenceStore = create<PresenceState>((set) => ({
    presence: {},
    setPresence: (userId, status) =>
        set((state) => ({
            presence: {
                ...state.presence,
                [userId]: status,
            },
        })),
}));
