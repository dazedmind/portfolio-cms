// import NavBar from "@/component/NavBar"
import SideBar from "@/component/SideBar";
import { useState, useEffect, lazy, Suspense } from "react";
import { X } from "lucide-react";
import { useTabManager } from "@/hooks/useTabManager";
import TabLoadingSkeleton from "@/component/TabLoadingSkeleton";
import "@/styles/tabs.css";
import SettingsPage from "./settings/SettingsPage";

// Lazy load tab components for code splitting
const ManageProfile = lazy(() => import("./manage-profile/ManageProfile"));
const ManageProjects = lazy(() => import("./manage-project/ManageProject"));
const ManageEmployment = lazy(() => import("./manage-employment/ManageEmployment"));
const ManageAccess = lazy(() => import("./manage-access/ManageAccess"));
const ManagePrompt = lazy(() => import("./manage-prompt/Manage-Prompt"));

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarEnter, setSidebarEnter] = useState(false);

  // Use custom tab manager hook
  const {
    activeTab,
    switchTab,
    preloadTab,
    cancelPreload,
    shouldMount,
    connectionSpeed,
  } = useTabManager("manage-profile");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/";
    }
  }, []);

  const handleTabChange = (tab: string) => {
    switchTab(tab);
  };

  const handleTabChangeAndCloseSidebar = (tab: string) => {
    switchTab(tab);
    handleCloseSidebar();
  };

  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
    // trigger enter animation on next frame
    requestAnimationFrame(() => setSidebarEnter(true));
  };

  const handleCloseSidebar = () => {
    // trigger exit animation
    setSidebarEnter(false);
    // wait for animation to finish before unmounting
    setTimeout(() => {
      setIsSidebarOpen(false);
    }, 300);
  };

  return (
    <div className="flex bg-background h-screen overflow-hidden">
      <aside className="hidden lg:block">
        <SideBar 
          handleTabChange={handleTabChange} 
          activeTab={activeTab}
          onTabHover={preloadTab}
          onTabHoverEnd={cancelPreload}
        />
      </aside>

      {!isSidebarOpen ? (
        <aside className="hidden">
          <SideBar 
            handleTabChange={handleTabChange} 
            activeTab={activeTab}
            onTabHover={preloadTab}
            onTabHoverEnd={cancelPreload}
          />
        </aside>
      ) : (
        <div
          className={`fixed inset-0 z-50 bg-black/80 h-screen w-screen ${
            sidebarEnter ? "slideIn" : "slideOut"
          }`}
        >
          <div
            className={`transition-transform duration-300 ease-out transform ${
              sidebarEnter ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <SideBar 
              handleTabChange={handleTabChangeAndCloseSidebar} 
              activeTab={activeTab}
              onTabHover={preloadTab}
              onTabHoverEnd={cancelPreload}
            />
          </div>
          <button
            className="bg-sidebar-accent rounded-md p-2 fixed top-4 right-4"
            onClick={handleCloseSidebar}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="flex-1 relative">
        {/* Performance indicator (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 right-2 z-50 text-xs bg-gray-800 px-2 py-1 rounded">
            Connection: {connectionSpeed}
          </div>
        )}

        {/* Keep visited tabs mounted but hidden with CSS for state preservation */}
        <div className="relative h-full">
          {shouldMount("manage-profile") && (
            <div 
              className={activeTab === "manage-profile" ? "block" : "hidden"}
              data-tab="manage-profile"
            >
              <Suspense fallback={<TabLoadingSkeleton />}>
                <ManageProfile handleOpenSidebar={handleOpenSidebar} />
              </Suspense>
            </div>
          )}

          {shouldMount("manage-projects") && (
            <div 
              className={activeTab === "manage-projects" ? "block" : "hidden"}
              data-tab="manage-projects"
            >
              <Suspense fallback={<TabLoadingSkeleton />}>
                <ManageProjects handleOpenSidebar={handleOpenSidebar} />
              </Suspense>
            </div>
          )}

          {shouldMount("manage-employment") && (
            <div 
              className={activeTab === "manage-employment" ? "block" : "hidden"}
              data-tab="manage-employment"
            >
              <Suspense fallback={<TabLoadingSkeleton />}>
                <ManageEmployment handleOpenSidebar={handleOpenSidebar} />
              </Suspense>
            </div>
          )}

          {shouldMount("manage-access") && (
            <div 
              className={activeTab === "manage-access" ? "block" : "hidden"}
              data-tab="manage-access"
            >
              <Suspense fallback={<TabLoadingSkeleton />}>
                <ManageAccess handleOpenSidebar={handleOpenSidebar} />
              </Suspense>
            </div>
          )}

          {shouldMount("manage-prompt") && (
            <div 
              className={activeTab === "manage-prompt" ? "block" : "hidden"}
              data-tab="manage-prompt"
            >
              <Suspense fallback={<TabLoadingSkeleton />}>
                <ManagePrompt handleOpenSidebar={handleOpenSidebar} />
              </Suspense>
            </div>
          )}

          {shouldMount("settings") && (
            <div 
              className={activeTab === "settings" ? "block" : "hidden"}
              data-tab="settings"
            >
              <Suspense fallback={<TabLoadingSkeleton />}>
                <SettingsPage />
              </Suspense>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
