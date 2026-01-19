import React from "react";
import { ResumeData } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface ResumeFormProps {
  data: ResumeData;
  handleDataChange: (updater: (draft: ResumeData) => void) => void;
}

export const ResumeForm = ({ data, handleDataChange }: ResumeFormProps) => {
  const handleChange = (path: string, value: any) => {
    handleDataChange((draft: any) => {
      // Simple dot notation handler for nested keys
      const keys = path.split(".");
      let current = draft;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    });
  };

  const addExperience = () => {
    handleDataChange((draft) => {
      draft.experience.push({
        title: "New Role",
        company: "Company Name",
        location: "",
        period: "Present",
        description: "",
      });
    });
  };

  const removeExperience = (index: number) => {
    handleDataChange((draft) => {
      draft.experience.splice(index, 1);
    });
  };

  const addEducation = () => {
    handleDataChange((draft) => {
      draft.education.push({
        degree: "New Degree",
        institution: "University",
        year: "2024",
      });
    });
  };

  const removeEducation = (index: number) => {
    handleDataChange((draft) => {
      draft.education.splice(index, 1);
    });
  };

  const addProject = () => {
    handleDataChange((draft) => {
      draft.projects.push({
        name: "New Project",
        description: "",
        techStack: [],
      });
    });
  };

  const removeProject = (index: number) => {
    handleDataChange((draft) => {
      draft.projects.splice(index, 1);
    });
  };

  // Safe Skills Handler
  const updateSkills = (value: string) => {
    const skillsArray = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    handleDataChange((draft) => {
      draft.skills = skillsArray;
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <Tabs
        defaultValue="personal"
        className="w-full flex-1 flex flex-col min-h-0"
      >
        <div className="border-b px-4 py-2 bg-muted/30">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="personal" className="text-xs px-1 py-1.5">
              Personal
            </TabsTrigger>
            <TabsTrigger value="exp" className="text-xs px-1 py-1.5">
              Experience
            </TabsTrigger>
            <TabsTrigger value="edu" className="text-xs px-1 py-1.5">
              Education
            </TabsTrigger>
            <TabsTrigger value="skills" className="text-xs px-1 py-1.5">
              Skills
            </TabsTrigger>
            <TabsTrigger value="projects" className="text-xs px-1 py-1.5">
              Projects
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
          {/* Personal Details Tab */}
          <TabsContent value="personal" className="mt-0 space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={data.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  value={data.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={data.contact?.email || ""}
                    onChange={(e) =>
                      handleChange("contact.email", e.target.value)
                    }
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={data.contact?.phone || ""}
                    onChange={(e) =>
                      handleChange("contact.phone", e.target.value)
                    }
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={data.contact?.location || ""}
                  onChange={(e) =>
                    handleChange("contact.location", e.target.value)
                  }
                  placeholder="New York, NY"
                />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input
                  value={data.contact?.linkedin || ""}
                  onChange={(e) =>
                    handleChange("contact.linkedin", e.target.value)
                  }
                  placeholder="linkedin.com/in/john"
                />
              </div>
              <div className="space-y-2">
                <Label>GitHub</Label>
                <Input
                  value={data.contact?.github || ""}
                  onChange={(e) =>
                    handleChange("contact.github", e.target.value)
                  }
                  placeholder="github.com/john"
                />
              </div>
              <div className="space-y-2">
                <Label>Summary</Label>
                <Textarea
                  value={typeof data.summary === "string" ? data.summary : ""}
                  onChange={(e) => handleChange("summary", e.target.value)}
                  className="min-h-[100px]"
                  placeholder="Professional summary..."
                />
              </div>
            </div>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="exp" className="mt-0 space-y-4">
            {Array.isArray(data.experience) &&
              data.experience.map((exp, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-lg space-y-3 relative group"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeExperience(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Title</Label>
                      <Input
                        value={exp.title || ""}
                        onChange={(e) =>
                          handleChange(
                            `experience.${index}.title`,
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Company</Label>
                      <Input
                        value={exp.company || ""}
                        onChange={(e) =>
                          handleChange(
                            `experience.${index}.company`,
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Date</Label>
                      <Input
                        value={exp.period || ""}
                        onChange={(e) =>
                          handleChange(
                            `experience.${index}.period`,
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Location</Label>
                      <Input
                        value={exp.location || ""}
                        onChange={(e) =>
                          handleChange(
                            `experience.${index}.location`,
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea
                      value={exp.description || ""}
                      onChange={(e) =>
                        handleChange(
                          `experience.${index}.description`,
                          e.target.value,
                        )
                      }
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              ))}
            <Button
              onClick={addExperience}
              variant="outline"
              className="w-full dashed border-primary/20 text-primary"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Experience
            </Button>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="edu" className="mt-0 space-y-4">
            {Array.isArray(data.education) &&
              data.education.map((edu, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-lg space-y-3 relative group"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeEducation(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <Label>Degree</Label>
                      <Input
                        value={edu.degree || ""}
                        onChange={(e) =>
                          handleChange(
                            `education.${index}.degree`,
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Institution</Label>
                      <Input
                        value={edu.institution || ""}
                        onChange={(e) =>
                          handleChange(
                            `education.${index}.institution`,
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Year</Label>
                      <Input
                        value={edu.year || ""}
                        onChange={(e) =>
                          handleChange(
                            `education.${index}.year`,
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            <Button
              onClick={addEducation}
              variant="outline"
              className="w-full dashed border-primary/20 text-primary"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Education
            </Button>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="mt-0 space-y-4">
            <div className="space-y-2">
              <Label>Skills (Comma separated)</Label>
              <Textarea
                value={(Array.isArray(data.skills) ? data.skills : []).join(
                  ", ",
                )}
                onChange={(e) => updateSkills(e.target.value)}
                className="min-h-[150px]"
                placeholder="React, TypeScript, Node.js..."
              />
              <p className="text-xs text-muted-foreground">
                Type your skills separated by commas.
              </p>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-0 space-y-4">
            {Array.isArray(data.projects) &&
              data.projects.map((proj, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-lg space-y-3 relative group"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeProject(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="space-y-1">
                    <Label>Project Name</Label>
                    <Input
                      value={proj.name || ""}
                      onChange={(e) =>
                        handleChange(`projects.${index}.name`, e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Tech Stack (Comma separated)</Label>
                    <Input
                      value={(proj.techStack || []).join(", ")}
                      onChange={(e) => {
                        const stack = e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        handleChange(`projects.${index}.techStack`, stack);
                      }}
                      placeholder="React, Firebase..."
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea
                      value={proj.description || ""}
                      onChange={(e) =>
                        handleChange(
                          `projects.${index}.description`,
                          e.target.value,
                        )
                      }
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              ))}
            <Button
              onClick={addProject}
              variant="outline"
              className="w-full dashed border-primary/20 text-primary"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Project
            </Button>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
