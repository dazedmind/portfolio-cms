import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/component/ui/select";
import { useState, useEffect } from "react";

// Popular tech stack icon names
const skillOptions = [
  { value: "React", label: "React" },
  { value: "JavaScript", label: "JavaScript" },
  { value: "TypeScript", label: "TypeScript" },
  { value: "Node.js", label: "Node.js" },
  { value: "Python", label: "Python" },
  { value: "Java", label: "Java" },
  { value: "html5", label: "HTML5" },
  { value: "CSS3", label: "CSS3" },
  { value: "Vue.js", label: "Vue.js" },
  { value: "Angular", label: "Angular" },
  { value: "Next.js", label: "Next.js" },
  { value: "Express", label: "Express" },
  { value: "MongoDB", label: "MongoDB" },
  { value: "PostgreSQL", label: "PostgreSQL" },
  { value: "MySQL", label: "MySQL" },
  { value: "Redis", label: "Redis" },
  { value: "Docker", label: "Docker" },
  { value: "AWS", label: "AWS" },
  { value: "Git", label: "Git" },
  { value: "GitHub", label: "GitHub" },
  { value: "GitLab", label: "GitLab" },
  { value: "Figma", label: "Figma" },
  { value: "Adobe XD", label: "Adobe XD" },
  { value: "Photoshop", label: "Photoshop" },
  { value: "Illustrator", label: "Illustrator" },
  { value: "Tailwind CSS", label: "Tailwind CSS" },
  { value: "Bootstrap", label: "Bootstrap" },
  { value: "Sass", label: "Sass" },
  { value: "Less", label: "Less" },
  { value: "Webpack", label: "Webpack" },
  { value: "Vite", label: "Vite" },
  { value: "npm", label: "npm" },
  { value: "yarn", label: "yarn" },
  { value: "Firebase", label: "Firebase" },
  { value: "GraphQL", label: "GraphQL" },
  { value: "REST API", label: "REST API" },
  { value: "Jest", label: "Jest" },
  { value: "Cypress", label: "Cypress" },
  { value: "custom", label: "Custom (Enter manually)" },
];

export default function AddSkillModal({ onSubmit, onClose, formData, setFormData }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void, onClose: () => void, formData: any, setFormData: (data: any) => void }) {
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    // Reset custom input state when formData is reset or iconName is cleared
    useEffect(() => {
      if (!formData.skillName) {
        setShowCustomInput(false);
      } else if (!skillOptions.some(skill => skill.value === formData.skillName)) {
        // If iconName is set but not in predefined options, show custom input
        setShowCustomInput(true);
      }
    }, [formData.skillName]);

    const handleIconChange = (value: string) => {
      if (value === "custom") {
        setShowCustomInput(true);
        setFormData({ ...formData, skillName: "" });
      } else {
        setShowCustomInput(false);
        setFormData({ ...formData, skillName: value });
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
                      htmlFor="iconName"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Choose a Skill
                    </label>
                    <Select 
                      value={formData.skillName && !showCustomInput ? formData.skillName : showCustomInput ? "custom" : undefined}
                      onValueChange={handleIconChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select or search for an icon" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {skillOptions.map((skill) => (
                          <SelectItem key={skill.value} value={skill.value}>
                            {skill.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showCustomInput && (
                      <Input
                        id="skillName"
                        placeholder="Enter custom skill name (e.g., 'React')"
                        type="text"
                        value={formData.skillName}
                        onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
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