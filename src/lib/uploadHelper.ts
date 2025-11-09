import { API_BASE_URL } from "./api";

/**
 * Upload a file to S3 via backend
 * @param file - The file to upload
 * @param folder - Optional folder path within the bucket (e.g., 'projects', 'profiles')
 * @returns The public URL of the uploaded file
 */
export const uploadFileViaBackend = async (
  file: File,
  folder: string = "uploads"
): Promise<string> => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Not authenticated");
    }

    // Create form data
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    // Upload to backend
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

/**
 * Delete a file from S3 via backend
 * @param fileUrl - The full URL of the file to delete
 * @returns true if deletion was successful
 */
export const deleteFileViaBackend = async (fileUrl: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url: fileUrl }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete file");
    }

    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

