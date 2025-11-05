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

export default function AddEmploymentModal({
  onSubmit,
  onClose,
  formData,
  setFormData,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  formData: any;
  setFormData: (data: any) => void;
}) {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date("2025-06-01")
  );
  const [month, setMonth] = React.useState<Date | undefined>(date);
  const [isActive, setIsActive] = React.useState(false);
  const [openStartDate, setOpenStartDate] = React.useState(false);
  const [startDateValue, setStartDateValue] = React.useState<Date | undefined>(undefined);
  const [openEndDate, setOpenEndDate] = React.useState(false);
  const [endDateValue, setEndDateValue] = React.useState<Date | undefined>(undefined);
  const [isClosing, setIsClosing] = useState(false);

  const handleCheckboxChange = (checked: boolean) => {
    setIsActive(checked);
    if (checked) {
      setFormData({ ...formData, isActive: true, endDate: null });
    } else {
      setFormData({ ...formData, isActive: false, endDate: new Date() });
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
        <h1 className="text-2xl font-semibold text-primary">Add Employment</h1>
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
                <Checkbox id="isActive" name="isActive" checked={isActive} onCheckedChange={handleCheckboxChange}></Checkbox>
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
                      {formatDate(startDateValue)
                        ? formatDate(startDateValue)
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
                      selected={date}
                      captionLayout="dropdown"
                      month={month}
                      onMonthChange={setMonth}
                      onSelect={(date) => {
                        setDate(date);
                        setStartDateValue(date);
                        setOpenStartDate(false);
                        setFormData({
                          ...formData,
                          startDate: formatDate(date),
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
                      disabled={isActive}
                    >
                      <CalendarIcon className="size-3.5" />
                      {formatDate(endDateValue)
                        ? formatDate(endDateValue)
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
                      selected={date}
                      captionLayout="dropdown"
                      month={month}
                      onMonthChange={setMonth}
                      onSelect={(date) => {
                        setDate(date);
                        setEndDateValue(date);
                        setOpenEndDate(false);
                        setFormData({ ...formData, endDate: formatDate(date) });
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
              Add Employment
            </Button>
          </span>
        </form>
      </div>
    </div>
  );
}
