import { Button } from "@/components/ui/button";
import { ImageIcon, Pencil, Trash2 } from "lucide-react";

interface ProjectCardProps {
  image: string;
  name: string;
  description: string;
  link: string;
  technologies: string[];
  type: string;
  id: number;
  handleEdit: (id: number) => void;
  handleDelete: (id: number) => void;
}

export default function ProjectCard({
  image,
  name,
  description,
  link,
  technologies,
  type,
  id,
  handleEdit,
  handleDelete,
}: ProjectCardProps) {

  return (
    <div className="flex border border-border bg-card rounded-lg p-6 gap-4 justify-between">
      <div className="flex gap-4">
        <span>
          {image === '' ? 
            <div>
              <div className="w-56 h-36 rounded-lg bg-muted border-2 border-border flex items-center justify-center">
                <ImageIcon className="w-8 h-8" />
              </div>
            </div> 
            : 
            <img src={image} alt="Project Image" className="w-56 h-36 rounded-lg" />
          }
        </span>

        <span className="flex flex-col">
          <p className="text-2xl font-bold">{name}</p>
          <p className="text-md italic leading-tight text-muted-foreground">{description}</p>
          <span className="mt-2">
            <p className="text-sm text-muted-foreground">
              Link:{" "}
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                {link}
              </a>
            </p>
            <p className="text-sm text-muted-foreground">
              Technologies: <span className="text-primary">{technologies}</span>
            </p>
            <p className="text-sm text-muted-foreground">Type: {type}</p>
          </span>
   
        </span>
      </div>

      <div className="flex gap-1">
        <Button variant="ghost" onClick={() => handleEdit(id)}>
          <Pencil className="w-4 h-4" />
          Edit
        </Button>
        <Button variant="ghost" onClick={() => handleDelete(id)}>
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
