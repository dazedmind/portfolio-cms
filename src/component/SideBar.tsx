import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import agfxLogo from "../assets/agfx-logo.png";
import {
  Briefcase,
  LogOut,
  Moon,
  Rocket,
  Settings,
  Sidebar,
  Sun,
  User,
  UserRoundPen,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

export default function SideBar({
  handleTabChange,
  activeTab,
}: {
  handleTabChange: (tab: string) => void;
  activeTab: string;
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null );
  // const [isLoading, setIsLoading] = useState(false);

  interface Profile {
    id: number;
    name: string;
    email: string;
    title: string;
    image: string;
  }

  const decodeJwt = <T,>(token: string): T | null => {
    try {
      const payload = token.split(".")[1];
      if (!payload) return null;
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
      const json = atob(padded);
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  };
  useEffect(() => {
    const fetchProfile = async () => {
      // setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.log("❌ No auth token found");
        // setIsLoading(false);
        return;
      }
      // Extract profileId from JWT
      const payload = decodeJwt<{ profileId?: number }>(token);
      if (!payload?.profileId) {
        toast.error("Invalid session. Please login again.");
        // setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile/${payload.profileId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("📨 Profile response status:", res.status);
        console.log("📨 Profile response:", res);

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          toast.error("Failed to load profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        // setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);


  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/";
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`bg-sidebar ${isSidebarOpen ? 'w-64' : 'w-16'} h-screen flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}>
      <div className={`flex items-center gap-2 ${isSidebarOpen ? 'justify-between p-6 pb-0' : 'justify-center p-2'} shrink-0`}>
        {isSidebarOpen && (
          <span className="flex items-center gap-2">
            <img src={agfxLogo} alt="Agfx logo" className="w-8 h-8" />
            <p className="text-xl font-medium whitespace-nowrap">Portfolio CMS</p>
          </span>
        )}

        <span className="hidden lg:block">
          <button
            onClick={handleSidebarToggle}
            className="cursor-pointer hover:text-muted-foreground hover:bg-sidebar-accent p-2 rounded-md transition-transform duration-300"
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <Sidebar className={`transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'} ${isSidebarOpen ? 'w-4 h-4' : 'w-5 h-5'}`} />
          </button>
        </span>
      </div>

      <div className="flex flex-col gap-2 justify-between flex-1 min-h-0">
        <div className={`flex flex-col ${isSidebarOpen ? 'items-start' : 'items-center'} gap-2 p-4 overflow-y-auto text-primary`}>
          <button
            onClick={() => handleTabChange("manage-profile")}
            className={`flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} gap-2 p-2 hover:text-muted-foreground hover:bg-sidebar-accent rounded-md cursor-pointer sidebar-button w-full ${activeTab === "manage-profile" ? "bg-sidebar-accent" : ""} transition-all duration-300`}
          >
            <UserRoundPen className="w-4 h-4" />
            <span className={`truncate transition-all duration-300 ${isSidebarOpen ? 'block' : 'hidden w-0'}`}>Manage Profile</span>
          </button>
          <button
            onClick={() => handleTabChange("manage-projects")}
            className={`flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} gap-2 p-2 hover:text-muted-foreground hover:bg-sidebar-accent rounded-md cursor-pointer sidebar-button w-full ${activeTab === "manage-projects" ? "bg-sidebar-accent" : ""} transition-all duration-300`}
          >
            <Rocket className="w-4 h-4" />
            <span className={`truncate transition-all duration-300 ${isSidebarOpen ? 'block' : 'hidden w-0'}`}>Manage Projects</span>
          </button>
          <button
            onClick={() => handleTabChange("manage-employment")}
            className={`flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} gap-2 p-2 hover:text-muted-foreground hover:bg-sidebar-accent rounded-md cursor-pointer sidebar-button w-full ${activeTab === "manage-employment" ? "bg-sidebar-accent" : ""} transition-all duration-300`}
          >
            <Briefcase className="w-4 h-4" />
            <span className={`truncate transition-all duration-300 ${isSidebarOpen ? 'block w-auto' : 'hidden w-0'}`}>Manage Employment</span>
          </button>
        </div>

        <div className="flex flex-col p-4 shrink-0 w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className={`flex items-center gap-2 ${isSidebarOpen ? 'p-2 hover:bg-sidebar-accent' : 'p-0 hover:bg-none'}  rounded-md cursor-pointer transition-all duration-300`}>

                {profile?.image ? 
                <img src={profile.image} alt="Profile" className={`w-8 h-8 rounded-full`} /> 
                : <User className="w-8 h-8 text-muted-foreground p-2 bg-accent rounded-full" />
                }

                <p className={`transition-all duration-300 ${isSidebarOpen ? 'block w-auto' : 'hidden w-0'}`}>{profile?.name}</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48 mb-2 bg-sidebar-accent rounded-md shadow-md outline-none"
              align="start"
            >
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer p-2 outline-none hover:bg-accent rounded-md"
              >
                <Settings className="w-4 h-4" />
                <p>Settings</p>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="flex items-center gap-2 cursor-pointer p-2 outline-none hover:bg-accent rounded-md"
              >
                {theme === "light" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                <p>{theme === "light" ? "Light Mode" : "Dark Mode"}</p>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer p-2 outline-none hover:bg-accent rounded-md"
              >
                <LogOut className="w-4 h-4" />
                <p>Logout</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
            </div>
          </div>        
    </div>
  );
}
