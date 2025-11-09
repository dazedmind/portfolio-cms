import { Input } from "@/component/ui/input";
import { Button } from "@/component/ui/button";
import { useState, useEffect, useRef } from "react";
import {
  Upload,
  User,
  Mail,
  Briefcase,
  FileText,
  Github,
  Linkedin,
  Palette,
  Facebook,
  Save,
  Plus,
  Trash2,
  Menu,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import LoadingPage from "@/component/LoadingPage";
import AddSkillModal from "./AddSkillModal";
import { API_BASE_URL } from "@/lib/api";
import { uploadFileViaBackend, deleteFileViaBackend } from "@/lib/uploadHelper";

interface Profile {
  id?: number;
  name: string;
  email: string;
  title: string;
  about: string;
  image?: string;
  github?: string;
  linkedin?: string;
  behance?: string;
  facebook?: string;
}

interface Skill {
  id: number;
  name: string;
  icon: string;
}

interface ManageProfileProps {
  handleOpenSidebar: () => void;
}
export default function ManageProfile({ handleOpenSidebar }: ManageProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [profileId, setProfileId] = useState<number>(0);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    skillName: "",
    skillCategory: "",
  });
  // Decode JWT (base64url) to extract payload
  const decodeJwt = <T,>(token: string): T | null => {
    try {
      const payload = token.split(".")[1];
      if (!payload) return null;
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "="
      );
      const json = atob(padded);
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  };

  const getProfileId = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log("❌ No auth token found");
      return;
    }
    const payload = decodeJwt<{ profileId?: number }>(token);
    setProfileId(payload?.profileId || 0);
    return payload?.profileId;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const profileId = getProfileId();
      setIsLoading(true);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.log("❌ No auth token found");
        setIsLoading(false);
        return;
      }
   
      if (!profileId) {
        toast.error("Invalid session. Please login again.");
        setIsLoading(false);
        return;
      } else {
        try {
          const res = await fetch(`${API_BASE_URL}/api/profile/${profileId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            setProfile(data);
            if (data.image) {
              setImagePreview(data.image);
            }
          } else {
            toast.error("Failed to load profile");
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load profile");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();
  }, []);

  const fetchSkills = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    const profileId = getProfileId();

    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log("❌ No auth token found");
      if (showLoading) setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/skills/${profileId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSkills(data);
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
      toast.error("Failed to fetch skills");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

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
      // Store the file for S3 upload
      setImageFile(file);
      setHasChanges(true);
    }
  };

  const handleInputChange = (field: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value } as Profile));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    let newImageUrl = profile?.image;
    const oldImageUrl = profile?.image;
    
    try {
      const token = localStorage.getItem("accessToken");
      
      // Upload new image via backend if a file is selected
      if (imageFile) {
        toast.loading("Uploading image...");
        newImageUrl = await uploadFileViaBackend(imageFile, "profile-picture");
        toast.dismiss();
      }

      // Prepare updated profile data
      const updatedProfile = {
        ...profile,
        image: newImageUrl,
      };

      const res = await fetch(`${API_BASE_URL}/api/profile/${profileId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProfile),
      });
      
      if (res.ok) {
        // Delete old image from S3 if a new image was uploaded
        if (imageFile && oldImageUrl && oldImageUrl !== newImageUrl) {
          try {
            await deleteFileViaBackend(oldImageUrl);
          } catch (s3Error) {
            console.error("Error deleting old image from S3:", s3Error);
            // Don't fail the whole operation if S3 delete fails
          }
        }
        
        toast.success("Profile updated successfully");
        setProfile(updatedProfile as Profile);
        setImageFile(null);
        setHasChanges(false);
      } else {
        // If backend fails and we uploaded a new image, delete it
        if (imageFile && newImageUrl !== oldImageUrl) {
          await deleteFileViaBackend(newImageUrl as string);
        }
        toast.error("Failed to update profile");
      }
    } catch (error) {
      // If any error occurs and we uploaded a new image, delete it
      if (imageFile && newImageUrl && newImageUrl !== oldImageUrl) {
        try {
          await deleteFileViaBackend(newImageUrl);
        } catch (deleteError) {
          console.error("Error deleting uploaded image:", deleteError);
        }
      }
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.skillName === "" || formData.skillCategory === "") {
      toast.error("Please fill all fields");
      return;
    }
    
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/api/skills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Skill added successfully");
        setIsAddSkillModalOpen(false);
        setFormData({ skillName: "", skillCategory: "" });
        // Refresh skills list immediately
        fetchSkills(false);
      } else {
        toast.error("Failed to add skill");
      }
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error("Failed to add skill");
    } 
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/api/skills/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        toast.success("Skill deleted successfully");
        fetchSkills(false);
      } else {
        toast.error("Failed to delete skill");
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast.error("Failed to delete skill");
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="h-screen overflow-hidden">
      <div className="space-y-8 h-full overflow-y-auto p-8 lg:p-10 pb-18 no-scrollbar">
        <div className="flex items-center justify-between">
          <span>
          <span className="flex items-center gap-2">
            <button className="flex items-center gap-3 text-xl lg:hidden py-2" onClick={handleOpenSidebar}>
                <Menu className="w-6 h-6" />
              </button>
            <h1 className="text-xl lg:text-3xl font-semibold text-primary">
              Manage Profile
            </h1>
          </span>
      
          <p className="text-xs lg:text-lg text-muted-foreground">
            Manage your profile information
          </p>
        </span>
          <Button onClick={handleSave} disabled={!hasChanges} className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="flex flex-col gap-6">
             {/* Avatar Section */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-medium text-primary">
                Profile Picture
              </h2>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-muted border-2 border-border overflow-hidden flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  JPG, PNG or GIF. Max size 5MB
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-medium text-primary">
                  Skills
                </h2>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <div key={skill.id} className="relative group">
                          <p className="p-2 px-3 border border-tertiary rounded-full text-sm group-hover:bg-black/40 group-hover:text-accent text-primary cursor-pointer motion-safe:transition-colors motion-safe:duration-200">
                            {skill.name}
                          </p>
                          <button
                            onClick={() => handleDeleteSkill(skill.id)}
                            className="text-sm text-primary absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 motion-safe:transition-opacity motion-safe:duration-200 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                    ))}
                  </div>
                    <Button onClick={() => setIsAddSkillModalOpen(true)} variant="outline" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Skill
                    </Button>
                </div>
              </div>
              {isAddSkillModalOpen && (
                <AddSkillModal
                  onSubmit={handleAddSkill}
                  onClose={() => setIsAddSkillModalOpen(false)}
                  formData={formData}
                  setFormData={setFormData}
                />
              )}
            </div>
          </div>
         

          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-medium text-primary">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Name
                  </label>
                  <Input
                    value={profile?.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Your full name"
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <Input
                    value={profile?.email ?? ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    type="email"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Title
                  </label>
                  <Input
                    value={profile?.title ?? ""}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Software Engineer, Designer"
                    type="text"
                  />
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-medium text-primary flex items-center gap-2">
                <FileText className="w-5 h-5" />
                About
              </h2>
              <textarea
                value={profile?.about ?? ""}
                onChange={(e) => handleInputChange("about", e.target.value)}
                className="w-full rounded-md border border-input bg-transparent p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none no-scrollbar disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Tell us about yourself..."
                rows={10}
              />
            </div>

            {/* Social Links */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-medium text-primary">Social Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    GitHub
                  </label>
                  <Input
                    value={profile?.github ?? ""}
                    onChange={(e) =>
                      handleInputChange("github", e.target.value)
                    }
                    placeholder="https://github.com/username"
                    type="url"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </label>
                  <Input
                    value={profile?.linkedin ?? ""}
                    onChange={(e) =>
                      handleInputChange("linkedin", e.target.value)
                    }
                    placeholder="https://linkedin.com/in/username"
                    type="url"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Behance
                  </label>
                  <Input
                    value={profile?.behance ?? ""}
                    onChange={(e) =>
                      handleInputChange("behance", e.target.value)
                    }
                    placeholder="https://behance.net/username"
                    type="url"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </label>
                  <Input
                    value={profile?.facebook ?? ""}
                    onChange={(e) =>
                      handleInputChange("facebook", e.target.value)
                    }
                    placeholder="https://facebook.com/username"
                    type="url"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
