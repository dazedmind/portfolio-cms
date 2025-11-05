import { Button } from "../component/ui/button";
import { Input } from "../component/ui/input";
import { ArrowRightIcon } from "lucide-react";
import NavBar from "@/component/NavBar";
import { Toaster, toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

export default function LoginPage() {

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const accessKey = formData.get("accessKey") as string;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessKey }),
      });

      // Get response text first to check if it's empty
      const responseText = await response.text();
      
      if (response.ok) {
        if (!responseText) {
          toast.error("Empty response from server");
          return;
        }
        
        try {
          const data = JSON.parse(responseText);
          // Store the JWT token in localStorage
          if (data.token) {
            localStorage.setItem("accessToken", data.token);
            window.location.href = "/home";
          } else {
            toast.error("No token received from server");
          }
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          toast.error("Invalid response format from server");
        }
      } else {
        // Try to parse error response, but handle empty responses
        let errorMessage = "Invalid access key";
        if (responseText) {
          try {
            const error = JSON.parse(responseText);
            errorMessage = error.error || errorMessage;
          } catch {
            // If it's not JSON, use the response text as error message
            errorMessage = responseText || errorMessage;
          }
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to connect to server. Make sure the server is running.");
    }
  };
  return (
    <div>
      <header>
        <NavBar />
      </header>

      <main className="flex items-center justify-center mt-40">
        <div className="flex flex-col gap-4 w-96  shadow-sm backdrop-blur-sm p-6 rounded">
            <h1 className="text-2xl font-medium text-primary">Enter access key</h1>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
                className="p-2 rounded-md text-primary outline-none border-none"
                placeholder="Access key"
                type="password"
                name="accessKey"
                id="accessKey"
                required
                minLength={6}
                maxLength={20}
                pattern="[A-Za-z0-9]{6,20}"
            />
            <Button
                className="p-2 rounded-md text-primary-foreground cursor-pointer"
                type="submit"
                variant={"default"}
                // onClick={window.location.href = "/home"}
            >
                Enter <ArrowRightIcon />
            </Button>
            </form>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
