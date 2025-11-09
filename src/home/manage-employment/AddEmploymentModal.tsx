import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/component/ui/popover";
import { Calendar } from "@/component/ui/calendar";
import React, { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Checkbox } from "@/component/ui/checkbox";
import { Label } from "@/component/ui/label"

// Format date for display (e.g., "Dec 25, 2025")
function formatDateDisplay(date: Date | undefined) {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

// Format date for backend (ISO format: "2025-12-25")
function formatDateForBackend(date: Date | undefined) {
  if (!date) {
    return "";
  }
  return date.toISOString().split('T')[0];
}

export default function AddEmploymentModal({
  onSubmit,
  onClose,
  formData,
  setFormData,
  isEditing,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  formData: any;
  setFormData: (data: any) => void;
  isEditing: boolean;
}) {
  // Parse date string to Date object
  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };

  // Initialize dates from formData when editing
  const initialStartDate = isEditing && formData.startDate 
    ? parseDate(formData.startDate) 
    : undefined;
  
  const initialEndDate = isEditing && formData.endDate 
    ? parseDate(formData.endDate) 
    : undefined;

  const [month, setMonth] = React.useState<Date | undefined>(initialStartDate);
  const [openStartDate, setOpenStartDate] = React.useState(false);
  const [startDateValue, setStartDateValue] = React.useState<Date | undefined>(initialStartDate);
  const [openEndDate, setOpenEndDate] = React.useState(false);
  const [endDateValue, setEndDateValue] = React.useState<Date | undefined>(initialEndDate);
  const [isClosing, setIsClosing] = useState(false);

  // Initialize formData dates when editing
  React.useEffect(() => {
    if (isEditing) {
      // Update formData with proper date formats if not already set
      if (initialStartDate && !formData.startDate) {
        setFormData({
          ...formData,
          startDate: formatDateForBackend(initialStartDate),
        });
      }
      if (initialEndDate && !formData.endDate && !formData.isActive) {
        setFormData({
          ...formData,
          endDate: formatDateForBackend(initialEndDate),
        });
      }
    }
  }, [isEditing]);

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, isActive: true, endDate: null });
      setEndDateValue(undefined);
    } else {
      const today = new Date();
      setFormData({ ...formData, isActive: false, endDate: formatDateForBackend(today) });
      setEndDateValue(today);
    }
  };

  const requestClose = () => {
    setIsClosing(true);
    // Match the CSS animation duration (300ms)
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`bg-card border border-border rounded-lg space-y-4 p-6 w-120 h-auto max-h-[90vh] overflow-y-auto ${isClosing ? 'fadeOut' : 'fadeIn'}`}>
        <h1 className="text-2xl font-semibold text-primary">{isEditing ? "Edit Employment" : "Add Employment"}</h1>
        <form onSubmit={onSubmit}>
          <div className="flex gap-4">
            <div className="space-y-2 w-full">
              <span className="flex flex-col gap-2">
                <label
                  htmlFor="company"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Company Name
                </label>
                <Input
                  id="company"
                  placeholder="Enter Company Name"
                  type="text"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                />
              </span>

              <span className="flex flex-col gap-2">
                <label
                  htmlFor="position"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Position
                </label>
                <Input
                  id="position"
                  placeholder="Enter Position"
                  type="text"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                />
              </span>

              <span className="flex flex-col gap-2">
                <label
                  htmlFor="companyDescription"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Company Description
                </label>
                <textarea
                  name="companyDescription"
                  id="companyDescription"
                  placeholder="Enter Company Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className="w-full h-24 border border-border rounded-md p-2 bg-accent outline-none resize-none text-sm"
                  maxLength={255}
                ></textarea>
              </span>
              <span className="flex items-center gap-2 my-4">
                <Checkbox id="isActive" name="isActive" checked={formData.isActive} onCheckedChange={handleCheckboxChange}></Checkbox>
                <Label htmlFor="isActive">I currently work here</Label>
              </span>

            <div className="flex space-x-10 w-full">
            <span className="flex flex-col gap-2">
                <label
                  htmlFor="companyStartDate"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Company Start Date
                </label>
                <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-picker"
                      variant="outline"
                      className="w-full justify-start font-normal"
                    >
                      <CalendarIcon className="size-3.5" />
                      <span className="sr-only">Select date</span>
                      {formatDateDisplay(startDateValue)
                        ? formatDateDisplay(startDateValue)
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="end"
                    alignOffset={-8}
                    sideOffset={10}
                  >
                    <Calendar
                      mode="single"
                      selected={startDateValue}
                      captionLayout="dropdown"
                      month={month}
                      onMonthChange={setMonth}
                      onSelect={(date) => {
                        setStartDateValue(date);
                        setOpenStartDate(false);
                        setFormData({
                          ...formData,
                          startDate: formatDateForBackend(date),
                        });
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </span>

              <span className="flex flex-col gap-2">
                <label
                  htmlFor="companyEndDate"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Company End Date
                </label>
                <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-picker"
                      variant="outline"
                      className="w-full justify-start font-normal"
                      disabled={formData.isActive}
                    >
                      <CalendarIcon className="size-3.5" />
                      {formatDateDisplay(endDateValue)
                        ? formatDateDisplay(endDateValue)
                        : "Select date"}
                      <span className="sr-only">Select date</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="end"
                    alignOffset={-8}
                    sideOffset={10}
                  >
                    <Calendar
                      mode="single"
                      selected={endDateValue}
                      captionLayout="dropdown"
                      month={month}
                      onMonthChange={setMonth}
                      onSelect={(date) => {
                        setEndDateValue(date);
                        setOpenEndDate(false);
                        setFormData({
                          ...formData,
                          endDate: formatDateForBackend(date),
                        });
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </span>
            </div>
             
            </div>
          </div>
          <span className="mt-4 flex items-center justify-end gap-2">
            <Button variant="outline" type="button" onClick={requestClose}>
              Close
            </Button>
            <Button variant="default" type="submit">
              {isEditing ? "Edit Employment" : "Add Employment"}
            </Button>
          </span>
        </form>
      </div>
    </div>
  );
}
