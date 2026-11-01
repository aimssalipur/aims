import { create } from "zustand";

interface SidebarStore {
  isOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: true,
  toggleSidebar: () =>
    set((state) => {
      const next = !state.isOpen;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("aims_dashboard_sidebar_open", next ? "true" : "false");
        } catch {}
      }
      return { isOpen: next };
    }),
  openSidebar: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("aims_dashboard_sidebar_open", "true");
      } catch {}
    }
    set({ isOpen: true });
  },
  closeSidebar: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("aims_dashboard_sidebar_open", "false");
      } catch {}
    }
    set({ isOpen: false });
  },
  setIsOpen: (isOpen: boolean) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("aims_dashboard_sidebar_open", isOpen ? "true" : "false");
      } catch {}
    }
    set({ isOpen });
  },
}));

