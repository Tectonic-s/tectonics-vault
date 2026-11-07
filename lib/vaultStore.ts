import { create } from "zustand";

/**
 * Cross-tree state for the 3D vault. Kept in zustand rather than context
 * because the camera rig, the shaft and the portals all need to read it
 * inside useFrame without re-rendering the tree.
 */
interface VaultStore {
  /** 0 → 1 across the whole descent. */
  progress: number;
  setProgress: (p: number) => void;
  /** id of the room the visitor is currently inside, or null in the shaft. */
  activeRoom: string | null;
  setActiveRoom: (id: string | null) => void;
  /** true once the intro has finished and travel is permitted. */
  opened: boolean;
  setOpened: (v: boolean) => void;
}

export const useVault = create<VaultStore>((set) => ({
  progress: 0,
  setProgress: (progress) => set({ progress }),
  activeRoom: null,
  setActiveRoom: (activeRoom) => set({ activeRoom }),
  opened: false,
  setOpened: (opened) => set({ opened }),
}));
