import { Button } from "@/component/ui/button";
import { Briefcase, Ghost, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import AddEmploymentModal from "./AddEmploymentModal";
import EmploymentCard from "./EmploymentCard";
import { API_BASE_URL } from "@/lib/api";

interface Employment {
  id: number;
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface ManageEmploymentProps {
  handleOpenSidebar: () => void;
}

export default function ManageEmployment({ handleOpenSidebar }: ManageEmploymentProps) {
  const [isAddEmploymentModalOpen, setIsAddEmploymentModalOpen] =
    useState(false);
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    description: "",
    startDate: "",
    endDate: "",
    isActive: "",
  });
  const [employments, setEmployments] = useState<Employment[]>([]);
  const [isEditEmploymentModalOpen, setIsEditEmploymentModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    company: "",
    position: "",
    description: "",
    startDate: "",
    endDate: "",
    isActive: "",
  });

  const fetchEmployments = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log("❌ No auth token found");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/employment`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Fetched employments:", data);
        setEmployments(data);
      } else {
        console.log("❌ Failed to fetch employments");
        const errorData = await response.json();
        console.log("Error details:", errorData);
      }
    } catch (error) {
      console.error("Error fetching employments:", error);
      toast.error("Failed to fetch employments");
    }
  };

  useEffect(() => {
    fetchEmployments();
  }, []);

  const handleAddEmployment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.log("📤 Submitting employment data:", formData);
    console.log("📅 Date formats - Start:", formData.startDate, "End:", formData.endDate);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
    const response = await fetch(`${API_BASE_URL}/api/employment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    if (response.ok) {
      toast.success("Employment added successfully");
      
      // Close modal and reset state
      handleCloseModal();
      
      // Refresh employments list
      fetchEmployments();
    } else {
      toast.error("Failed to add employment");
      toast.error(data.error);
    }
  };

  const handleCloseModal = () => {
    setIsEditEmploymentModalOpen(false);
    setIsAddEmploymentModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    
    // Reset add form data
    setFormData({
      company: "",
      position: "",
      description: "",
      startDate: "",
      endDate: "",
      isActive: "",
    });
    
    // Reset edit form data
    setEditFormData({
      company: "",
      position: "",
      description: "",
      startDate: "",
      endDate: "",
      isActive: "",
    });
  };

  const handleEditButtonClick = (id: number) => {
    setIsEditEmploymentModalOpen(true);
    setIsEditing(true);
    setEditingId(id);
    setEditFormData({
      company: employments.find((employment) => employment.id === id)?.company || "",
      position: employments.find((employment) => employment.id === id)?.position || "",
      description: employments.find((employment) => employment.id === id)?.description || "",
      startDate: employments.find((employment) => employment.id === id)?.startDate || "",
      endDate: employments.find((employment) => employment.id === id)?.endDate || "",
      isActive: employments.find((employment) => employment.id === id)?.isActive || false,
    } as any);
  };

  const handleEditEmployment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.log("📤 Submitting edited employment data:", editFormData);
    console.log("📅 Date formats - Start:", editFormData.startDate, "End:", editFormData.endDate);
    
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
    const res = await fetch(`${API_BASE_URL}/api/employment/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editFormData),
    });
    if (res.ok) {
      toast.success("Employment edited successfully");
      
      // Close modal and reset state
      handleCloseModal();
      
      // Refresh employments list
      fetchEmployments();
    } else {
      toast.error("Failed to edit employment");
      const data = await res.json();
      toast.error(data.error);
    }
  }

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/employment/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        toast.success("Employment deleted successfully");
        fetchEmployments();
      } else {
        toast.error("Failed to delete employment");
      }
    } catch (error) {
      console.error("Error deleting employment:", error);
      toast.error("Failed to delete employment");
    }
  };

  return (
    <div className="h-screen overflow-hidden p-8 lg:p-10 pb-12">
      <div className="flex items-center justify-between overflow-y-auto pb-6">
        <span>
          <span className="flex items-center gap-2">
            <button className="flex items-center gap-3 text-xl lg:hidden py-2" onClick={handleOpenSidebar}>
                <Menu className="w-6 h-6" />
              </button>
            <h1 className="text-xl lg:text-3xl font-semibold text-primary">
              Manage Experience
            </h1>
          </span>
      
          <p className="text-xs lg:text-lg text-muted-foreground">
            Manage your employment history
          </p>
        </span>
        <Button
          onClick={() => setIsAddEmploymentModalOpen(true)}
          className="gap-2"
        >
          <Briefcase className="w-4 h-4" />
          Add New
        </Button>
      </div>{" "}
      <div className="space-y-8 h-full overflow-y-auto pb-18 no-scrollbar">
        <div className="my-6 space-y-4">
          {employments.length > 0 ? (
            <div className="space-y-4">
              {employments.map((employment) => (
                <EmploymentCard
                  key={employment.id}
                  id={employment.id}
                  company={employment.company}
                  position={employment.position}
                  description={employment.description}
                  startDate={new Date(employment.startDate)}
                  endDate={new Date(employment.endDate)}
                  isActive={employment.isActive}
                  handleEdit={(id: number) => handleEditButtonClick(id)}
                  handleDelete={(id: number) => handleDelete(id)}
                />
              ))}
            </div>
          ) : (
            <div className="my-40 space-y-1 text-center">
              <Ghost className="w-12 h-12 mx-auto" />
              <h1 className="text-2xl font-semibold text-primary">
                No Employments Yet
              </h1>
              <p className="text-muted-foreground">
                Add a employment to get started
              </p>
            </div>
          )}
        </div>
      </div>
      {isAddEmploymentModalOpen && (
        <AddEmploymentModal
          onSubmit={handleAddEmployment}
          onClose={handleCloseModal}
          formData={formData as unknown as Employment}
          setFormData={(data: any) => setFormData(data)}
          isEditing={isEditing}
        />
      )}
      {isEditEmploymentModalOpen && (
        <AddEmploymentModal
          onSubmit={handleEditEmployment}
          onClose={handleCloseModal}
          formData={editFormData as unknown as Employment}
          setFormData={(data: any) => setEditFormData(data)}
          isEditing={isEditing}
        />
      )}
      <Toaster />
    </div>
  );
}
