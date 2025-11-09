import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/component/ui/select";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function AddProjectModal({ onSubmit, onClose, formData, setFormData, isEditing, editingFormData }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void, onClose: () => void, formData: any, setFormData: (data: any) => void, isEditing: boolean, editingFormData: any }) {

  const [imagePreview, setImagePreview] = useState<string>("");
  const [isClosing, setIsClosing] = useState(false);

  // Set initial preview for editing mode
  useEffect(() => {
    if (isEditing && editingFormData.projectImage) {
      setImagePreview(editingFormData.projectImage);
    } else {
      setImagePreview(""); // Clear preview when not editing
    }
  }, [isEditing, editingFormData.projectImage]);

  // Reset preview when modal closes
  useEffect(() => {
    return () => {
      setImagePreview("");
    };
  }, []);

  const requestClose = () => {
    setIsClosing(true);
    // Clear preview
    setImagePreview("");
    // Match the CSS animation duration (300ms)
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Store the actual File object for S3 upload
      setFormData((prev: any) => ({ ...prev, projectImageFile: file }));
    }
  };
  
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`bg-card border border-border rounded-lg space-y-4 p-6 w-2/4 h-auto ${isClosing ? 'fadeOut' : 'fadeIn'}`}>
          <h1 className="text-2xl font-semibold text-primary mb-2">
            {isEditing ? "Edit Project" : "Add Project"}
          </h1>

            <form onSubmit={onSubmit}>
              <div className="flex gap-4">
                <span className="w-full">

                  <p className="text-sm font-medium text-muted-foreground mb-2">Select Project Image</p>
                  <label htmlFor="projectImage" className="text-sm font-medium text-muted-foreground  cursor-pointer">
                    <div className="flex flex-col gap-1 items-center justify-center border border-tertiary rounded-md w-auto h-48">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Project Image" className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <div className="flex flex-col gap-1 items-center justify-center">
                          <h1 className="text-lg font-semibold">Upload Image</h1>
                          <p className="text-sm text-muted-foreground">Drag and drop or click to browse</p>
                          <p className="text-sm text-muted-foreground">Images only • Max 5MB</p>
                        </div>
                      )}
                    </div>
                    <input 
                      id="projectImage" 
                      type="file" 
                      name="projectImage" 
                      accept="image/*"
                      onChange={handleImageChange} 
                      className="p-2 border border-border rounded-md w-56 h-36 hidden"
                    />
                  </label>
                </span>
                <div className="space-y-2 w-full">
                  <span className="flex flex-col gap-2">
                    <label
                      htmlFor="projectName"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Project Name
                    </label>
                    <Input
                      id="projectName"
                      placeholder="Enter Project Name"
                      type="text"
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    />
                  </span>

                  <span className="flex flex-col gap-2">
                      <label
                        htmlFor="projectDescription"
                        className="text-sm font-medium text-muted-foreground"
                      >
                        Project Description
                      </label>
      
                      <textarea name="projectDescription" id="projectDescription" placeholder="Enter Project Description" value={formData.projectDescription} onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })} className="w-full h-24 border border-border rounded-md p-2 bg-accent outline-none resize-none text-sm" maxLength={255}></textarea>
                  </span>
                  <span className="flex flex-col gap-2">
                    <label
                      htmlFor="projectLink"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Project Link
                    </label>
                    <Input
                      id="projectLink"
                      placeholder="Enter Project Link"
                      type="text"
                      value={formData.projectLink}
                      onChange={(e) => setFormData({ ...formData, projectLink: e.target.value })}
                    />
                  </span>
                  <span className="flex flex-col gap-2">
                    <label
                      htmlFor="projectTechnologies"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Project Technologies
                    </label>
                    <Input
                      id="projectTechnologies"
                      placeholder="Enter Project Technologies"
                      type="text"
                      value={formData.projectTechnologies}
                      onChange={(e) => setFormData({ ...formData, projectTechnologies: e.target.value })}
                    />
                  </span>
                  <label
                    htmlFor="projectType"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Project Type
                  </label>
                  <Select value={formData.projectType} onValueChange={(value) => setFormData({ ...formData, projectType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Project Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web App">Web App</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="UI/UX Design">UI/UX</SelectItem>
                      <SelectItem value="Portfolio">Portfolio</SelectItem>
                      <SelectItem value="Mobile App">Mobile App</SelectItem>

                    </SelectContent>
                  </Select>
                </div>
              </div>
              <span className="mt-4 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={requestClose}
                >
                  Close
                </Button>
                <Button
                  variant="default"
                  type="submit"
                >
                  {isEditing ? "Update Project" : "Add Project"}
                </Button>
              </span>
            </form>
          </div>
        </div>
    )
}