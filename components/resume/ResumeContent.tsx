import React from "react";
import { ResumeData } from "@/lib/types";
import { templateStyles } from "@/lib/constants/template-styles";

interface ResumeContentProps {
  data: ResumeData;
  isEditable?: boolean;
  onContentEdit?: (key: "name" | "title", value: string) => void;
  template?: string;
}

export const ResumeContent = ({
  data,
  isEditable = false,
  onContentEdit,
  template = "modern",
}: ResumeContentProps) => {
  const styles =
    templateStyles[template as keyof typeof templateStyles] ||
    templateStyles.modern;

  const handleEdit = (
    key: "name" | "title",
    e: React.FocusEvent<HTMLElement>,
  ) => {
    if (onContentEdit) {
      onContentEdit(key, e.target.innerText.trim());
    }
  };

  return (
    <div
      className={`template-${template} ${styles.container} print:shadow-none`}
    >
      {/* Header Section */}
      {(data.name || "") && (
        <div className={styles.nameContainer}>
          {data.name && (
            <h1 className={styles.name}>
              {isEditable ? (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleEdit("name", e)}
                >
                  {data.name}
                </span>
              ) : (
                data.name
              )}
            </h1>
          )}
          {data.title && (
            <p className={styles.title}>
              {isEditable ? (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleEdit("title", e)}
                >
                  {data.title}
                </span>
              ) : (
                data.title
              )}
            </p>
          )}
        </div>
      )}
      {/* ...existing code... */}
      {/* Summary Section */}
      {data.summary && (
        <section>
          <h2 className={styles.sectionHeader}>Summary</h2>
          <p className={`${styles.text} leading-relaxed whitespace-pre-line`}>
            {typeof data.summary === "string"
              ? data.summary
              : typeof data.summary === "object" && data.summary
                ? JSON.stringify(data.summary)
                : String(data.summary || "")}
          </p>
        </section>
      )}

      {/* Skills Section */}
      {data.skills?.length > 0 && (
        <section>
          <h2 className={styles.sectionHeader}>Skills</h2>
          {template === "classic" ? (
            <p className={styles.skills}>
              {(Array.isArray(data.skills) ? data.skills : [])
                .map((skill) =>
                  typeof skill === "string" ? skill : String(skill),
                )
                .join(" • ")}
            </p>
          ) : (
            <ul className={styles.skills}>
              {(Array.isArray(data.skills) ? data.skills : []).map(
                (skill, idx) => (
                  <li key={idx} className={styles.skillItem}>
                    {typeof skill === "string"
                      ? skill
                      : typeof skill === "object" && skill
                        ? JSON.stringify(skill)
                        : String(skill || "")}
                  </li>
                ),
              )}
            </ul>
          )}
        </section>
      )}

      {/* Projects Section */}
      {Array.isArray(data.projects) && data.projects.some((p) => p.name) && (
        <section>
          <h2 className={styles.sectionHeader}>Projects</h2>
          <div className="space-y-1">
            {data.projects.map(
              (project, idx) =>
                project.name && (
                  <div key={idx}>
                    <h3 className={styles.projectTitle}>{project.name}</h3>
                    {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                      <p className={styles.projectTech}>
                        {template === "creative"
                          ? `// ${project.techStack.join(" / ")}`
                          : template === "techie"
                            ? `[${project.techStack.join(", ")}]`
                            : template === "artistic"
                              ? `✨ ${project.techStack.join(" • ")}`
                              : project.techStack.join(", ")}
                      </p>
                    )}
                    <p className={`${styles.text} whitespace-pre-line`}>
                      {typeof project.description === "string"
                        ? project.description
                        : typeof project.description === "object" &&
                          project.description
                          ? JSON.stringify(project.description)
                          : String(project.description || "")}
                    </p>
                  </div>
                ),
            )}
          </div>
        </section>
      )}

      {/* Experience Section */}
      {Array.isArray(data.experience) && data.experience.some((exp) => exp.title) && (
        <section>
          <h2 className={styles.sectionHeader}>Experience</h2>
          <div className="space-y-1">
            {data.experience.map(
              (exp, idx) =>
                exp.title && (
                  <div key={idx}>
                    <h3 className={styles.expTitle}>{exp.title}</h3>
                    <p className={styles.expDetails}>
                      {template === "professional"
                        ? `${exp.company} | ${exp.location} | ${exp.period}`
                        : template === "creative"
                          ? `${exp.company} // ${exp.location} // ${exp.period}`
                          : template === "techie"
                            ? `${exp.company} :: ${exp.location} :: ${exp.period}`
                            : template === "artistic"
                              ? `${exp.company} ✦ ${exp.location} ✦ ${exp.period}`
                              : `${exp.company} - ${exp.location} (${exp.period})`}
                    </p>
                    <p className={`${styles.text} whitespace-pre-line`}>
                      {typeof exp.description === "string"
                        ? exp.description
                        : typeof exp.description === "object" && exp.description
                          ? JSON.stringify(exp.description)
                          : String(exp.description || "")}
                    </p>
                  </div>
                ),
            )}
          </div>
        </section>
      )}

      {/* Education Section */}
      {Array.isArray(data.education) && data.education.some((edu) => edu.degree) && (
        <section>
          <h2 className={styles.sectionHeader}>Education</h2>
          <div>
            {data.education.map(
              (edu, idx) =>
                edu.degree && (
                  <div key={idx}>
                    <h3 className={styles.eduTitle}>{edu.degree}</h3>
                    <p
                      className={
                        template === "professional"
                          ? styles.expDetails
                          : "text-sm text-gray-500"
                      }
                    >
                      {template === "professional"
                        ? `${edu.institution} | ${edu.year}`
                        : template === "creative"
                          ? `${edu.institution} // ${edu.year}`
                          : template === "techie"
                            ? `${edu.institution} :: ${edu.year}`
                            : template === "artistic"
                              ? `${edu.institution} ✦ ${edu.year}`
                              : `${edu.institution} (${edu.year})`}
                    </p>
                  </div>
                ),
            )}
          </div>
        </section>
      )}

      {/* Achievements Section */}
      {Array.isArray(data.achievements) && data.achievements.length > 0 && (
        <section>
          <h2 className={styles.sectionHeader}>Achievements</h2>
          <ul
            className={
              template === "professional"
                ? `${styles.text} list-none`
                : template === "creative"
                  ? `${styles.text} list-none`
                  : template === "techie"
                    ? `${styles.text} list-none`
                    : template === "artistic"
                      ? `${styles.text} list-none`
                      : template === "executive"
                        ? `${styles.text} list-none`
                        : template === "corporate"
                          ? `${styles.text} list-none`
                          : `${styles.text} list-disc list-inside`
            }
          >
            {data.achievements.map((ach, idx) => (
              <li
                key={idx}
                className={
                  template === "professional"
                    ? "border-l-2 border-gray-400 pl-2"
                    : template === "creative"
                      ? "bg-white bg-opacity-30 p-1 rounded"
                      : template === "techie"
                        ? "before:content-['>>'] before:text-green-500 before:mr-2"
                        : template === "artistic"
                          ? "bg-linear-to-r from-pink-100 to-purple-100 p-1 rounded border border-purple-200"
                          : template === "executive"
                            ? "bg-gray-100 p-1 border-l-2 border-gray-800"
                            : template === "corporate"
                              ? "bg-blue-100 p-1 border-l-2 border-blue-900"
                              : ""
                }
              >
                {typeof ach === "string"
                  ? ach
                  : typeof ach === "object" && ach
                    ? JSON.stringify(ach)
                    : String(ach || "")}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Contact Section */}
      {Object.values(data.contact).some(Boolean) && (
        <section>
          <h2 className={styles.sectionHeader}>Contact</h2>
          <div className={styles.contactList}>
            {data.contact.email && (
              <div
                className={
                  template === "creative"
                    ? "bg-white bg-opacity-30 p-1 rounded"
                    : template === "artistic"
                      ? "bg-linear-to-r from-pink-100 to-purple-100 p-1 rounded border border-purple-200"
                      : ""
                }
              >
                <strong>Email:</strong> {data.contact.email}
              </div>
            )}
            {data.contact.phone && (
              <div
                className={
                  template === "creative"
                    ? "bg-white bg-opacity-30 p-1 rounded"
                    : template === "artistic"
                      ? "bg-linear-to-r from-pink-100 to-purple-100 p-1 rounded border border-purple-200"
                      : ""
                }
              >
                <strong>Phone:</strong> {data.contact.phone}
              </div>
            )}
            {data.contact.github && (
              <div
                className={
                  template === "creative"
                    ? "bg-white bg-opacity-30 p-1 rounded"
                    : template === "artistic"
                      ? "bg-linear-to-r from-pink-100 to-purple-100 p-1 rounded border border-purple-200"
                      : ""
                }
              >
                <strong>GitHub:</strong> {data.contact.github}
              </div>
            )}
            {data.contact.linkedin && (
              <div
                className={
                  template === "creative"
                    ? "bg-white bg-opacity-30 p-1 rounded"
                    : template === "artistic"
                      ? "bg-linear-to-r from-pink-100 to-purple-100 p-1 rounded border border-purple-200"
                      : ""
                }
              >
                <strong>LinkedIn:</strong> {data.contact.linkedin}
              </div>
            )}
            {data.contact.blogs && (
              <div
                className={
                  template === "creative"
                    ? "bg-white bg-opacity-30 p-1 rounded"
                    : template === "artistic"
                      ? "bg-linear-to-r from-pink-100 to-purple-100 p-1 rounded border border-purple-200"
                      : ""
                }
              >
                <strong>Blogs:</strong> {data.contact.blogs}
              </div>
            )}
            {data.contact.location && (
              <div
                className={
                  template === "creative"
                    ? "bg-white bg-opacity-30 p-1 rounded"
                    : template === "artistic"
                      ? "bg-linear-to-r from-pink-100 to-purple-100 p-1 rounded border border-purple-200"
                      : ""
                }
              >
                <strong>Location:</strong> {data.contact.location}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
