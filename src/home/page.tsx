// import NavBar from "@/component/NavBar"
import SideBar from "@/component/SideBar";
import { useState, useEffect } from "react";
import ManageProfile from "./manage-profile/ManageProfile";
import ManageProjects from "./manage-project/ManageProject";
import ManageEmployment from "./manage-employment/ManageEmployment";
import { X } from "lucide-react";
import ManageAccess from "./manage-access/ManageAccess";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("manage-profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarEnter, setSidebarEnter] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/";
    }
  }, []);
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
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
        <SideBar handleTabChange={handleTabChange} activeTab={activeTab} />
      </aside>

      {!isSidebarOpen ? (
        <aside className="hidden">
          <SideBar handleTabChange={handleTabChange} activeTab={activeTab} />
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
            <SideBar handleTabChange={handleTabChange} activeTab={activeTab} />
          </div>
          <button
            className="bg-sidebar-accent rounded-md p-2 fixed top-4 right-4"
            onClick={handleCloseSidebar}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="flex-1">
        <div className="">
          {activeTab === "manage-profile" && (
            <ManageProfile handleOpenSidebar={handleOpenSidebar} />
          )}
          {activeTab === "manage-projects" && (
            <ManageProjects handleOpenSidebar={handleOpenSidebar} />
          )}
          {activeTab === "manage-employment" && (
            <ManageEmployment handleOpenSidebar={handleOpenSidebar} />
          )}
          {activeTab === "manage-access" && (
            <ManageAccess handleOpenSidebar={handleOpenSidebar} />
          )}
        </div>
      </main>
    </div>
  );
}
