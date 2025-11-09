import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { API_BASE_URL } from "@/lib/api";
import { Menu, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/component/ui/button";
// import { decodeToken } from "@/lib/auth";

export default function ManagePrompt({
  handleOpenSidebar,
}: {
  handleOpenSidebar: () => void;
}) {
//   const [formData, setFormData] = useState<{ prompt: string }>({ prompt: "" });
  const [prompt, setPrompt] = useState<string>("");

  const decodeJwt = <T,>(token: string): T | null => {
    try {
      const payload = token.split(".")[1];
      if (!payload) return null;
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "="
      );
      const json = atob(padded);
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  };

  const getProfileId = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }
    const payload = decodeJwt<{ profileId?: number }>(token);
    return payload?.profileId;
  };

  const profileId = getProfileId();

  const [hasPrompt, setHasPrompt] = useState(false);

  const fetchPrompt = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/prompt/${profileId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPrompt(data[0].prompt);
        setHasPrompt(true);
      } else {
        setHasPrompt(false);
      }
    } catch {
      toast.error("Failed to fetch prompt");
    }
  };

  useEffect(() => {
    fetchPrompt();
  }, [profileId]);

  const handleAddPrompt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/prompt`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        setPrompt(data.prompt);
        toast.success("Prompt updated");
      }
    } catch {
      toast.error("Failed to update prompt");
    }
  };

  const handleUpdatePrompt = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/prompt`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        setPrompt(data[0].prompt);
        toast.success("Prompt updated");
      }
    } catch {
      toast.error("Failed to update prompt");
    }
  };

  const handleDeletePrompt = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      <div className="space-y-8 h-full overflow-y-auto p-8 lg:p-10 pb-18 no-scrollbar">
        <div className="flex items-center justify-between">
          <span>
            <span className="flex items-center gap-2">
              <button
                className="flex items-center gap-3 text-xl lg:hidden py-2"
                onClick={handleOpenSidebar}
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl lg:text-3xl font-semibold text-primary">
                Manage Prompt
              </h1>
            </span>

            <p className="text-xs lg:text-lg text-muted-foreground">
              Manage ASTA&apos;s system prompt
            </p>
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <form onSubmit={handleAddPrompt} className="flex flex-col gap-2">
              <textarea
                value={prompt || ""}
                name="prompt"
                onChange={(e) => setPrompt(e.target.value as string)}
                className="w-full rounded-md border border-input bg-transparent font-mono focus:outline-none p-2 text-sm no-scrollbar"
                placeholder="Enter your prompt"
                rows={20}
              ></textarea>

              <span className="flex gap-2">
                <Button className="w-fit" variant="default" type="submit" disabled={hasPrompt}>
                  <Plus className="w-4 h-4" />
                  Add System Prompt
                </Button>
                <Button className="w-fit" variant="outline" type="button" onClick={handleUpdatePrompt}>
                  <Pencil className="w-4 h-4" />
                  Update System Prompt
                </Button>
                <Button className="w-fit" variant="destructive" onClick={handleDeletePrompt}>
                  <Trash2 className="w-4 h-4" />
                  Delete System Prompt
            </Button>
              </span>
            </form>
         
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
