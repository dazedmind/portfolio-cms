import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ManageEmployment() {
  const handleAddEmployment = () => {
    console.log("Add Employment");
  };
  return (
    <div className="h-screen overflow-hidden pb-12">
      <div className="flex items-center justify-between overflow-y-auto">
        <span>
          <h1 className="text-3xl font-semibold text-primary">
            Manage Employment
          </h1>
        </span>
        <Button onClick={() => handleAddEmployment()} className="gap-2">
          <PlusCircle className="w-4 h-4" />
          Add Employment
        </Button>
      </div>{" "}
    </div>
  );
}
