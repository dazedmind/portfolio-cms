import { Button } from "@/component/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";
import { Menu } from "lucide-react";

export default function ManageAccess({
  handleOpenSidebar,
}: {
  handleOpenSidebar: () => void;
}) {
  const [apiKey, setApiKey] = useState<string>("");
  const fetchApiKey = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/api/key`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey);
      }
    } catch {}
  };
  const rotateApiKey = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/api/key/rotate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey);
        toast.success("API key regenerated");
      }
    } catch {
      toast.error("Failed to regenerate API key");
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
                Manage Access
              </h1>
            </span>

            <p className="text-xs lg:text-lg text-muted-foreground">
              Manage your access key and API keys
            </p>
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              value={apiKey}
              readOnly
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded-md border border-input bg-transparent p-2 text-sm"
              placeholder="Generate an API key"
            />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(apiKey || "");
                toast.success("Copied");
              }}
              disabled={!apiKey}
            >
              Copy
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="default" onClick={fetchApiKey}>
              View key
            </Button>
            <Button variant="destructive" onClick={rotateApiKey}>
              Regenerate
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This key is tied to your account and can be used to access read
            endpoints that require an API key. Keep it secret.
          </p>
        </div>
      </div>
    </div>
  );
}
