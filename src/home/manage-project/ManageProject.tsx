import { useState, useEffect } from "react";
import ProjectCard from "./ProjectCard";
import { Button } from "@/component/ui/button";
import { Ghost, Menu, PlusCircle } from "lucide-react";
import { toast, Toaster } from "sonner";
import AddProjectModal from "./AddProjectModal";
import { API_BASE_URL } from "@/lib/api";

interface ManageProjectProps {
  handleOpenSidebar: () => void;
}
export default function ManageProject({ handleOpenSidebar }: ManageProjectProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  // const [imagePreview, setImagePreview] = useState<string>("");
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    projectDescription: "",
    projectLink: "",
    projectTechnologies: "",
    projectType: "",
  });
  //   const [projectImage, setProjectImage] = useState<File | null>(null);

  interface Project {
    id: number;
    image: string;
    name: string;
    description: string;
    link: string;
    technologies: string[];
    type: string;
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


  const getProfileId = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }
    const payload = decodeJwt<{ profileId?: number }>(token);
    return payload?.profileId;
  };

  const profileId = getProfileId();

  const fetchProjects = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log("❌ No auth token found");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/project/${profileId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        console.log("❌ Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddItem = () => {
    setIsAddProjectModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddProjectModalOpen(false);
    setFormData({
      projectName: "",
      projectDescription: "",
      projectLink: "",
      projectTechnologies: "",
      projectType: "",
    });
  };

  const handleAddProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Not authenticated");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const created = await response.json();
        toast.success("Project added successfully");
        setIsAddProjectModalOpen(false);
        setProjects((prev) => [...prev, created]);
        setFormData({
          projectName: "",
          projectDescription: "",
          projectLink: "",
          projectTechnologies: "",
          projectType: "",
        });
        fetchProjects();
      } else {
        let msg = "Failed to add project";
        try {
          const err = await response.json();
          if (err?.error) msg = err.error;
        } catch {}
        toast.error(msg);
      }
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Failed to add project");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Not authenticated");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/project/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        toast.success("Project deleted successfully");
        // Optimistically remove then refresh from server to reflect backend state
        setProjects((prev) => prev.filter((project) => project.id !== id));
        fetchProjects();
      } else {
        toast.error("Failed to delete project");
        fetchProjects();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Not authenticated");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/project/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success("Project edited successfully");
        setProjects((prev) => prev.map((project) => project.id === id ? { ...project, ...formData } : project));
      } else {
        toast.error("Failed to edit project");
      }
    } catch (error) {
      console.error("Error editing project:", error);
      toast.error("Failed to edit project");
    }
  };

  return (
    <div className="h-screen overflow-hidden p-8 lg:p-10 pb-12">
      <div className="flex items-center justify-between overflow-y-auto pb-6">
        <div>
          <span className="flex items-center gap-2">
            <button className="flex items-center gap-3 text-xl lg:hidden py-2" onClick={handleOpenSidebar}>
                <Menu className="w-6 h-6" />
              </button>
            <h1 className="text-xl lg:text-3xl font-semibold text-primary">
              Manage Projects
            </h1>
          </span>
      
          <p className="text-xs lg:text-lg text-muted-foreground">
          Total Projects: {projects.length}
          </p>
        </div>
        <Button onClick={() => handleAddItem()} className="gap-2">
          <PlusCircle className="w-4 h-4" />
          Add Project
        </Button>
      </div>{" "}
      <div className="space-y-8 h-full overflow-y-auto pb-18 no-scrollbar">
        {projects.length > 0 ? (
        <div className="my-6 space-y-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              image={project.image}
              id={project.id}
              handleEdit={(id: number) => handleEdit(id)}
              handleDelete={(id: number) => handleDelete(id)}
              name={project.name}
              description={project.description}
              link={project.link}
              technologies={project.technologies}
              type={project.type}
            />
          ))}
        </div>
        ) : (
          <div className="my-40 space-y-1 text-center">
            <Ghost className="w-12 h-12 mx-auto" />
            <h1 className="text-2xl font-semibold text-primary">No Projects Yet</h1>
            <p className="text-muted-foreground">Add a project to get started</p>
          </div>
        )}
      </div>
      {isAddProjectModalOpen && (
        <AddProjectModal
          onSubmit={handleAddProject}
          onClose={handleCloseModal}
          formData={formData}
          setFormData={setFormData}
        />
      )}
      <Toaster />
    </div>
  );
}
