import { Button } from "@/component/ui/button";
import { ImageIcon, Pencil, Trash2 } from "lucide-react";

interface ProjectCardProps {
  image: string;
  name: string;
  description: string;
  link: string;
  technologies: string[];
  type: string;
  id: number;
  hasArticle: boolean;
  articleLink: string;
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
  hasArticle,
  articleLink,
  handleEdit,
  handleDelete,
}: ProjectCardProps) {
  console.log("ProjectCard props:", { id, hasArticle, articleLink });

  return (
    <div className="flex flex-col lg:flex-row border border-border bg-card rounded-lg p-6 gap-4 justify-between w-full">
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <span className="aspect-video w-100 h-auto object-cover flex items-center justify-center bg-muted border-2 border-border rounded-lg overflow-hidden">
        {image ? (
            <img
              src={image}
              alt="Project Image"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-10 h-10 text-muted-foreground" />
          )}
        </span>
        <span className="flex flex-col w-full">
          <p className="text-2xl font-bold">{name}</p>
          <p className="text-md italic leading-tight text-muted-foreground">{description}</p>
          <span className="mt-2">
            <p className="text-sm text-muted-foreground">
              Link:{" "}
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                {link.slice(0, 30)}...
              </a>
            </p>
            <p className="text-sm text-muted-foreground">
              Technologies: <span className="text-primary">{technologies}</span>
            </p>
            <p className="text-sm text-muted-foreground">Type: {type}</p>
            {hasArticle ? (
              <p className="text-sm text-muted-foreground">
                Article: {articleLink ? (
                <a href={articleLink} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    {articleLink.slice(0, 30)}...
                  </a>
                ) : null}
              </p>
            ) : null}
          </span>
   
        </span>
      </div>

      <div className="grid-cols-2 grid lg:flex gap-2">
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
