// import NavBar from "@/component/NavBar"
import SideBar from "@/component/SideBar";
import { useState, useEffect } from "react";
import ManageProfile from "./manage-profile/ManageProfile";
import ManageProjects from "./manage-project/ManageProject";
import ManageEmployment from "./manage-employment/ManageEmployment";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("manage-profile");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/";
    }
  }, []);
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex bg-background h-screen overflow-hidden">
      <aside>
        <SideBar handleTabChange={handleTabChange} activeTab={activeTab} />
      </aside>
      <main className="flex-1">
        {/* <NavBar /> */}
        <div className="p-8">
          {activeTab === "manage-profile" && <ManageProfile />}
          {activeTab === "manage-projects" && <ManageProjects />}
          {activeTab === "manage-employment" && <ManageEmployment />}
        </div>
      </main>
    </div>
  );
}
