import { useState, useEffect } from "react";
import ProjectCard from "./ProjectCard";
import { Button } from "@/component/ui/button";
import { Ghost, Menu, PlusCircle } from "lucide-react";
import { toast, Toaster } from "sonner";
import AddProjectModal from "./AddProjectModal";
import { API_BASE_URL } from "@/lib/api";
import { uploadFileViaBackend, deleteFileViaBackend } from "@/lib/uploadHelper";

interface ManageProjectProps {
  handleOpenSidebar: () => void;
}
export default function ManageProject({ handleOpenSidebar }: ManageProjectProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  // const [imagePreview, setImagePreview] = useState<string>("");
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    projectName: string;
    projectDescription: string;
    projectLink: string;
    projectTechnologies: string;
    projectType: string;
    projectImage: string;
    projectImageFile?: File;
    hasArticle: boolean;
    articleLink: string;
  }>({
    projectName: "",
    projectDescription: "",
    projectLink: "",
    projectTechnologies: "",
    projectType: "",
    projectImage: "",
    hasArticle: false,
    articleLink: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editingFormData, setEditingFormData] = useState<{
    projectName: string;
    projectDescription: string;
    projectLink: string;
    projectTechnologies: string[] | never[];
    projectType: string;
    projectImage: string;
    projectImageFile?: File;
    hasArticle: boolean;
    articleLink: string;
  }>({
    projectName: "",
    projectDescription: "",
    projectLink: "",
    projectTechnologies: [] as never[],
    projectType: "",
    projectImage: "",
    hasArticle: false,
    articleLink: "",
  });

  interface Project {
    id: number;
    image: string;
    name: string;
    description: string;
    link: string;
    technologies: string[];
    type: string;
    hasArticle: boolean;
    articleLink: string;
  }

  const fetchProjects = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log("❌ No auth token found");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/project`, {
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
    setIsEditProjectModalOpen(false);
    setEditingProjectId(null);
    setIsEditing(false);
    
    // Reset add form data
    setFormData({
      projectName: "",
      projectDescription: "",
      projectLink: "",
      projectTechnologies: "",
      projectType: "",
      projectImage: "",
      projectImageFile: undefined,
      hasArticle: false,
      articleLink: "",
    });
    
    // Reset edit form data
    setEditingFormData({
      projectName: "",
      projectDescription: "",
      projectLink: "",
      projectTechnologies: [] as never[],
      projectType: "",
      projectImage: "",
      projectImageFile: undefined,
      hasArticle: false,
      articleLink: "",
    } as any);
  };

  const handleAddProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    let uploadedImageUrl = "";
    
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      // Upload image via backend if a file is selected
      if (formData.projectImageFile) {
        toast.loading("Uploading image...");
        uploadedImageUrl = await uploadFileViaBackend(formData.projectImageFile, "project");
        toast.dismiss();
      }

      // Prepare data for backend (backend expects 'image' not 'projectImage')
      const projectData = {
        projectName: formData.projectName,
        projectDescription: formData.projectDescription,
        projectLink: formData.projectLink,
        projectTechnologies: formData.projectTechnologies,
        projectType: formData.projectType,
        image: uploadedImageUrl, // Changed from projectImage to image
        hasArticle: formData.hasArticle,
        articleLink: formData.articleLink,
      };

      const response = await fetch(`${API_BASE_URL}/api/project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });
      
      if (response.ok) {
        toast.success("Project added successfully");
        // Close modal and reset state
        handleCloseModal();
        
        // Refresh projects list
        fetchProjects();
      } else {
        // If backend fails, delete the uploaded image
        if (uploadedImageUrl) {
          await deleteFileViaBackend(uploadedImageUrl);
        }
        let msg = "Failed to add project";
        try {
          const err = await response.json();
          if (err?.error) msg = err.error;
        } catch {}
        toast.error(msg);
      }
    } catch (error) {
      // If any error occurs, delete the uploaded image
      if (uploadedImageUrl) {
        try {
          await deleteFileViaBackend(uploadedImageUrl);
        } catch (deleteError) {
          console.error("Error deleting uploaded image:", deleteError);
        }
      }
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

      // Find the project to get its image URL
      const projectToDelete = projects.find((project) => project.id === id);
      
      const response = await fetch(`${API_BASE_URL}/api/project/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        // Delete image from S3 if it exists
        if (projectToDelete?.image) {
          try {
            await deleteFileViaBackend(projectToDelete.image);
          } catch (s3Error) {
            console.error("Error deleting image from S3:", s3Error);
            // Don't fail the whole operation if S3 delete fails
          }
        }
        
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

  const handleEditButtonClick = (id: number) => {
    const projectToEdit = projects.find((project) => project.id === id);
    if (!projectToEdit) return;
  
    setEditingProjectId(id);
    setIsEditing(true);
    setIsEditProjectModalOpen(true);
  
    setEditingFormData({
      projectName: projectToEdit.name,
      projectDescription: projectToEdit.description,
      projectLink: projectToEdit.link,
      projectTechnologies: projectToEdit.technologies as unknown as never[],
      projectType: projectToEdit.type,
      projectImage: projectToEdit.image,
      hasArticle: projectToEdit.hasArticle,
      articleLink: projectToEdit.articleLink ?? "",
    } as any);
  };

  const handleEditProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    let newImageUrl = editingFormData.projectImage;
    const oldImageUrl = projects.find((p) => p.id === editingProjectId)?.image;
    
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      // Upload new image via backend if a new file is selected
      if (editingFormData.projectImageFile) {
        toast.loading("Uploading image...");
        newImageUrl = await uploadFileViaBackend(editingFormData.projectImageFile, "project");
        toast.dismiss();
      }

      // Prepare data for backend (backend expects 'image' not 'projectImage')
      const projectData = {
        projectName: editingFormData.projectName,
        projectDescription: editingFormData.projectDescription,
        projectLink: editingFormData.projectLink,
        projectTechnologies: editingFormData.projectTechnologies,
        projectType: editingFormData.projectType,
        image: newImageUrl, // Changed from projectImage to image
        hasArticle: editingFormData.hasArticle,
        articleLink: editingFormData.articleLink,
      };

      const response = await fetch(`${API_BASE_URL}/api/project/${editingProjectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });
      
      if (response.ok) {
        // Delete old image from S3 if a new image was uploaded
        if (editingFormData.projectImageFile && oldImageUrl && oldImageUrl !== newImageUrl) {
          try {
            await deleteFileViaBackend(oldImageUrl);
          } catch (s3Error) {
            console.error("Error deleting old image from S3:", s3Error);
            // Don't fail the whole operation if S3 delete fails
          }
        }
        
        toast.success("Project edited successfully");
        
        // Close modal and reset state
        handleCloseModal();
        
        // Refresh projects list
        fetchProjects();
      } else {
        // If backend fails and we uploaded a new image, delete it
        if (editingFormData.projectImageFile && newImageUrl !== oldImageUrl) {
          await deleteFileViaBackend(newImageUrl);
        }
        toast.error("Failed to edit project");
      }
    } catch (error) {
      // If any error occurs and we uploaded a new image, delete it
      if (editingFormData.projectImageFile && newImageUrl && newImageUrl !== oldImageUrl) {
        try {
          await deleteFileViaBackend(newImageUrl);
        } catch (deleteError) {
          console.error("Error deleting uploaded image:", deleteError);
        }
      }
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
              handleEdit={(id: number) => handleEditButtonClick(id)}
              handleDelete={(id: number) => handleDelete(id)}
              name={project.name}
              description={project.description}
              link={project.link}
              technologies={project.technologies}
              type={project.type}
              hasArticle={project.hasArticle}
              articleLink={project.articleLink || ""}
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
          isEditing={isEditing}
          editingFormData={editingFormData}
        />
      )}
      {isEditProjectModalOpen && (
          <AddProjectModal
            onSubmit={handleEditProject}
            onClose={handleCloseModal}
            formData={editingFormData}
            setFormData={(data: any) => setEditingFormData(data)}
            isEditing={isEditing}
            editingFormData={editingFormData}
          />
        )
      }
      <Toaster />
    </div>
  );
}
