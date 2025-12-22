import { Telescope } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="h-screen overflow-hidden">
      <div className="space-y-8 h-full overflow-y-auto p-8 lg:p-10 pb-18 no-scrollbar">
        <div className="flex items-center justify-between">
          <span>
            <h1 className="text-xl lg:text-3xl font-semibold text-primary">
              Settings
            </h1>
            <p className="text-xs lg:text-lg text-muted-foreground">
              Manage your settings
            </p>
          </span>
        </div>
       
        <div className="flex flex-col items-center justify-center mt-40">
            <Telescope className="w-10 h-10 text-muted-foreground" />
            <h1 className="text-2xl font-bold">Coming soon</h1>
            <p>This feature is not available yet</p>
        </div>
    
      </div>
    </div>
  )
}