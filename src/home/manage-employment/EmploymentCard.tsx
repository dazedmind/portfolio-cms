import { Button } from "@/component/ui/button";
import { Briefcase, Pencil, Trash2 } from "lucide-react";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

interface EmploymentCardProps {
  company: string;
  position: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  id: number;
  handleEdit: (id: number) => void;
  handleDelete: (id: number) => void;
}

export default function EmploymentCard({
  company,
  position,
  description,
  startDate,
  endDate,
  isActive,
  id,
  handleEdit,
  handleDelete,
}: EmploymentCardProps) {
  return (
    <div className="flex flex-col lg:flex-row border border-border bg-card rounded-lg p-6 gap-4 justify-between">
      <div className="flex gap-4">
        <span className="flex flex-col">
          <p className="text-xl font-bold">{company}</p>
          <p className="flex items-center gap-2 text-md italic leading-tight text-muted-foreground">
            <Briefcase className="w-4 h-4" />
            {position}
          </p>
          <span className="mt-2">
            <p className="text-sm text-muted-foreground">
              Description: <span className="text-primary">{description}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Employment Date:{" "}
              <span className="text-primary">
                {formatDate(startDate)} -{" "}
                {isActive ? "Present" : formatDate(endDate)}
              </span>
            </p>
          </span>
        </span>
      </div>

      <div className="grid-cols-2 grid gap-2">
        <Button variant="outline" onClick={() => handleEdit(id)} className="col-span-1">
          <Pencil className="w-4 h-4" />
          Edit
        </Button>
        <Button variant="destructive" onClick={() => handleDelete(id)} className="col-span-1">
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
