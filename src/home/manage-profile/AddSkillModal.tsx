import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/component/ui/select";
import { useState, useEffect } from "react";

// Popular tech stack icon names
const iconOptions = [
  { value: "react", label: "React" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "nodejs", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "html5", label: "HTML5" },
  { value: "css3", label: "CSS3" },
  { value: "vue", label: "Vue.js" },
  { value: "angular", label: "Angular" },
  { value: "nextjs", label: "Next.js" },
  { value: "express", label: "Express" },
  { value: "mongodb", label: "MongoDB" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "redis", label: "Redis" },
  { value: "docker", label: "Docker" },
  { value: "aws", label: "AWS" },
  { value: "git", label: "Git" },
  { value: "github", label: "GitHub" },
  { value: "gitlab", label: "GitLab" },
  { value: "figma", label: "Figma" },
  { value: "adobe-xd", label: "Adobe XD" },
  { value: "photoshop", label: "Photoshop" },
  { value: "illustrator", label: "Illustrator" },
  { value: "tailwindcss", label: "Tailwind CSS" },
  { value: "bootstrap", label: "Bootstrap" },
  { value: "sass", label: "Sass" },
  { value: "less", label: "Less" },
  { value: "webpack", label: "Webpack" },
  { value: "vite", label: "Vite" },
  { value: "npm", label: "NPM" },
  { value: "yarn", label: "Yarn" },
  { value: "firebase", label: "Firebase" },
  { value: "graphql", label: "GraphQL" },
  { value: "rest", label: "REST API" },
  { value: "jest", label: "Jest" },
  { value: "cypress", label: "Cypress" },
  { value: "custom", label: "Custom (Enter manually)" },
];

export default function AddSkillModal({ onSubmit, onClose, formData, setFormData }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void, onClose: () => void, formData: any, setFormData: (data: any) => void }) {
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    // Reset custom input state when formData is reset or iconName is cleared
    useEffect(() => {
      if (!formData.iconName) {
        setShowCustomInput(false);
      } else if (!iconOptions.some(icon => icon.value === formData.iconName)) {
        // If iconName is set but not in predefined options, show custom input
        setShowCustomInput(true);
      }
    }, [formData.iconName]);

    const handleIconChange = (value: string) => {
      if (value === "custom") {
        setShowCustomInput(true);
        setFormData({ ...formData, iconName: "" });
      } else {
        setShowCustomInput(false);
        setFormData({ ...formData, iconName: value });
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
          <div className={`bg-card border border-border rounded-lg space-y-4 p-4 w-100 h-auto max-h-[90vh] overflow-y-auto ${isClosing ? 'fadeOut' : 'fadeIn'}`}>
            <h1 className="text-2xl font-semibold text-primary">Add Skill</h1>
            <form onSubmit={onSubmit}>
              <div className="flex gap-4">
                <div className="space-y-2 w-full">
                  <span className="flex flex-col gap-2">
                    <label
                      htmlFor="skillName"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Skill Name
                    </label>
                    <Input
                      id="skillName"
                      placeholder="Enter Skill Name"
                      type="text"
                      value={formData.skillName}
                      onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
                    />
                  </span>

                  <span className="flex flex-col gap-2">
                    <label
                      htmlFor="iconName"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Icon Name
                    </label>
                    <Select 
                      value={formData.iconName && !showCustomInput ? formData.iconName : showCustomInput ? "custom" : undefined}
                      onValueChange={handleIconChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select or search for an icon" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {iconOptions.map((icon) => (
                          <SelectItem key={icon.value} value={icon.value}>
                            {icon.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showCustomInput && (
                      <Input
                        id="iconName"
                        placeholder="Enter custom icon name (e.g., 'my-icon')"
                        type="text"
                        value={formData.iconName}
                        onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                        className="mt-2"
                      />
                    )}
                  </span>
       
                  <label
                    htmlFor="skillCategory"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Skill Category
                  </label>
                  <Select value={formData.skillCategory} onValueChange={(value) => setFormData({ ...formData, skillCategory: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Skill Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Frontend">Frontend</SelectItem>
                      <SelectItem value="Backend">Backend</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
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
                  Add Skill
                </Button>
              </span>
            </form>
          </div>
        </div>
    )
}