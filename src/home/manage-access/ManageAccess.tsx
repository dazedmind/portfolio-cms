import { Button } from "@/component/ui/button";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { Menu } from "lucide-react";

export default function ManageAccess({
  handleOpenSidebar,
}: {
  handleOpenSidebar: () => void;
}) {
  const [apiKey, setApiKey] = useState<string>("");
  const [generatedKeys, setGeneratedKeys] = useState<string>("");
  const [hasGeneratedKeys, setHasGeneratedKeys] = useState<boolean>(false);

  const fetchApiKey = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/.netlify/functions/apiKey`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedKeys(data.apiKey);
        setHasGeneratedKeys(true);
      }
    } catch {}
  };

  useEffect(() => {
    fetchApiKey();
  }, []);

  const rotateApiKey = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/.netlify/functions/apiKey`, {
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard");
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/.netlify/functions/apiKey`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("API key deleted");
        setGeneratedKeys("");
        setHasGeneratedKeys(false);
      } else {
        toast.error("Failed to delete API key");
      }
    } catch {
      toast.error("Failed to delete API key");
    }
    toast.success("Deleted");
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
              className="w-full rounded-md border border-input bg-transparent p-2 text-sm focus:outline-none"
              placeholder="Generate an API key"
            />
            <Button
              variant="outline"
              onClick={() => handleCopy(apiKey || "")}
              disabled={!apiKey}
            >
              Copy
            </Button>
            <Button variant="default" onClick={rotateApiKey} disabled={hasGeneratedKeys}>
              Regenerate
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            This key is tied to your account and can be used to access read
            endpoints that require an API key. Keep it secret.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Generated API Key</h2>

          <div className="flex items-center gap-2">
            <input type="password" value={generatedKeys} readOnly disabled onFocus={(e) => e.currentTarget.select()} className="w-full rounded-md border border-input bg-transparent p-2 text-sm focus:outline-none" />
            <Button variant="outline" onClick={() => handleCopy(generatedKeys)}>
              Copy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Only one API key is allowed. Delete the existing key to generate a new one.
          </p>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
