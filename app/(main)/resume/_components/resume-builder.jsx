"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveResume } from "@/actions/resume";
import { EntryForm } from "./entry-form";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";
import html2pdf from "html2pdf.js/dist/html2pdf.min.js";

export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  const formValues = watch();

  useEffect(() => {
    if (initialContent) {
      setActiveTab("preview");
    }
  }, [initialContent]);

  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
    }
  }, [formValues, activeTab]);

  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }

    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];

    if (contactInfo.email) {
      parts.push(`📧 ${contactInfo.email}`);
    }

    if (contactInfo.mobile) {
      parts.push(`📱 ${contactInfo.mobile}`);
    }

    if (contactInfo.linkedin) {
      parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    }

    if (contactInfo.twitter) {
      parts.push(`🐦 [Twitter](${contactInfo.twitter})`);
    }

    return parts.length > 0
      ? `## <div align="center">${user?.fullName || ""}</div>

<div align="center">

${parts.join(" | ")}

</div>`
      : "";
  };

  const getCombinedContent = () => {
    const {
      summary,
      skills,
      experience,
      education,
      projects,
    } = formValues;

    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const element = document.getElementById("resume-pdf");

      const opt = {
        margin: [15, 15],
        filename: "resume.pdf",
        image: {
          type: "jpeg",
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async () => {
    try {
      const formattedContent = previewContent
        .replace(/\n/g, "\n")
        .replace(/\n\s*\n/g, "\n\n")
        .trim();

      await saveResumeFn(formattedContent);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  return (
    <div data-color-mode="light" className="w-full space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="font-bold gradient-title text-4xl md:text-5xl">
          Resume Builder
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="destructive"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>

          <Button
            variant="default"
            onClick={generatePDF}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* TABS */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="edit">
            Form
          </TabsTrigger>

          <TabsTrigger value="preview">
            Markdown
          </TabsTrigger>
        </TabsList>

        {/* FORM TAB */}
        <TabsContent value="edit" className="mt-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full space-y-8"
          >

            {/* CONTACT INFORMATION */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Contact Information
              </h3>

              <div className="grid w-full grid-cols-1 gap-4 rounded-lg border bg-muted/50 p-4 md:grid-cols-2">

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Email
                  </label>

                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="your@email.com"
                    error={errors.contactInfo?.email}
                    className="w-full"
                  />

                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Mobile Number
                  </label>

                  <Input
                    {...register("contactInfo.mobile")}
                    type="tel"
                    placeholder="+91 9876543210"
                    className="w-full"
                  />

                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.mobile.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    LinkedIn URL
                  </label>

                  <Input
                    {...register("contactInfo.linkedin")}
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                    className="w-full"
                  />

                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Twitter/X Profile
                  </label>

                  <Input
                    {...register("contactInfo.twitter")}
                    type="url"
                    placeholder="https://twitter.com/your-handle"
                    className="w-full"
                  />

                  {errors.contactInfo?.twitter && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.twitter.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Professional Summary
              </h3>

              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="min-h-32 w-full"
                    placeholder="Write a compelling professional summary..."
                    error={errors.summary}
                  />
                )}
              />

              {errors.summary && (
                <p className="text-sm text-red-500">
                  {errors.summary.message}
                </p>
              )}
            </div>

            {/* SKILLS */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Skills
              </h3>

              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="min-h-32 w-full"
                    placeholder="List your key skills..."
                    error={errors.skills}
                  />
                )}
              />

              {errors.skills && (
                <p className="text-sm text-red-500">
                  {errors.skills.message}
                </p>
              )}
            </div>

            {/* EXPERIENCE */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Work Experience
              </h3>

              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Experience"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            {/* EDUCATION */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Education
              </h3>

              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Education"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              {errors.education && (
                <p className="text-sm text-red-500">
                  {errors.education.message}
                </p>
              )}
            </div>

            {/* PROJECTS */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Projects
              </h3>

              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Project"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              {errors.projects && (
                <p className="text-sm text-red-500">
                  {errors.projects.message}
                </p>
              )}
            </div>

          </form>
        </TabsContent>

        {/* MARKDOWN TAB */}
        <TabsContent value="preview" className="mt-6">

          <div className="mb-4 flex items-center justify-between gap-3">

            <Button
              variant="outline"
              type="button"
              onClick={() =>
                setResumeMode(
                  resumeMode === "preview"
                    ? "edit"
                    : "preview"
                )
              }
            >
              {resumeMode === "preview" ? (
                <>
                  <Edit className="h-4 w-4" />
                  Edit Resume
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  Show Preview
                </>
              )}
            </Button>

          </div>

          {resumeMode !== "preview" && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border-2 border-yellow-600 p-3 text-yellow-600">
              <AlertTriangle className="h-5 w-5 shrink-0" />

              <span className="text-sm">
                You will lose edited markdown if you update the form data.
              </span>
            </div>
          )}

          <div className="w-full overflow-hidden rounded-lg border">
            <MDEditor
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={resumeMode}
            />
          </div>

          {/* PDF CONTENT */}
          <div className="hidden">
            <div id="resume-pdf">
              <MDEditor.Markdown
                source={previewContent}
                style={{
                  background: "white",
                  color: "black",
                }}
              />
            </div>
          </div>

        </TabsContent>
      </Tabs>
    </div>
  );
}