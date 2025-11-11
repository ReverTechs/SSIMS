"use client";

import { useState } from "react";
import { UserRole } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  School,
  Building2,
  Calendar,
  Quote,
  Info,
  Save,
  X,
  AlertTriangle,
  Upload,
} from "lucide-react";
import Image from "next/image";

interface AboutSchoolContentProps {
  userRole: UserRole;
}

interface SchoolData {
  fullName: string;
  centerName: string;
  backgroundInfo: string;
  logo: string;
  schoolType: "government" | "private";
  governmentCategory?:
    | "national"
    | "district"
    | "conventional"
    | "CDSS"
    | "mission";
  motto: string;
  yearEstablished: string;
}

const initialSchoolData: SchoolData = {
  fullName: "Wynberg Boys' High School",
  centerName: "MTSS005",
  backgroundInfo:
    "Wynberg Boys' High School is a prestigious educational institution committed to academic excellence, character development, and holistic education. Established with a vision to nurture future leaders, the school provides a comprehensive curriculum that balances academic rigor with extracurricular activities. Our dedicated faculty and modern facilities create an environment where students can thrive academically, socially, and personally.",
  logo: "/images/Coat_of_arms_of_Malawi.svg.png",
  schoolType: "government",
  governmentCategory: "national",
  motto: "Excellence Through Dedication",
  yearEstablished: "1950",
};

export function AboutSchoolContent({ userRole }: AboutSchoolContentProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [schoolData, setSchoolData] = useState<SchoolData>(initialSchoolData);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Check if user can edit
  const canEdit = ["admin", "headteacher", "deputy_headteacher"].includes(
    userRole
  );

  const handleInputChange = (field: keyof SchoolData, value: string) => {
    setSchoolData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setSchoolData((prev) => ({
          ...prev,
          logo: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditMode(false);
    setLogoPreview(null);
    // In production, save to database here
  };

  const handleCancel = () => {
    setSchoolData(initialSchoolData);
    setIsEditMode(false);
    setLogoPreview(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* <div>
          <h1 className="text-3xl font-bold tracking-tight">About School</h1>
          <p className="text-muted-foreground mt-2">
            Learn about our school's history, values, and mission
          </p>
        </div> */}
        {canEdit && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="edit-mode" className="text-sm font-medium">
                Edit Mode
              </Label>
              <Switch
                id="edit-mode"
                checked={isEditMode}
                onCheckedChange={setIsEditMode}
              />
            </div>
          </div>
        )}
      </div>

      {/* Warning Alert when in edit mode */}
      {isEditMode && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <strong>Warning:</strong> You are in edit mode. Please review all
            changes carefully before saving. All modifications will be permanent
            once saved.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* School Logo Card */}
        <Card className="md:col-span-2 border-0 shadow-lg bg-gradient-to-br from-background via-background to-muted/20 min-h-[200px]">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              {isEditMode ? (
                <div className="w-full flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg ring-2 ring-primary/10 dark:ring-primary/20 transition-all duration-300 group-hover:ring-primary/30 group-hover:scale-105">
                      {(logoPreview || schoolData.logo) && (
                        <Image
                          src={logoPreview || schoolData.logo}
                          alt="School Logo"
                          fill
                          className="object-contain p-3"
                          unoptimized={logoPreview ? true : false}
                        />
                      )}
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-lg italic font-light text-foreground/80 dark:text-foreground/90 leading-relaxed tracking-wide">
                      &ldquo;{schoolData.motto}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <Label
                      htmlFor="logo-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 font-medium"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload New Logo
                    </Label>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative group">
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg ring-2 ring-primary/10 dark:ring-primary/20 transition-all duration-300 hover:ring-primary/30 hover:scale-105">
                      {schoolData.logo && (
                        <Image
                          src={schoolData.logo}
                          alt="School Logo"
                          fill
                          className="object-contain p-3"
                        />
                      )}
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-lg italic font-light text-foreground/80 dark:text-foreground/90 leading-relaxed tracking-wide">
                      &ldquo;{schoolData.motto}&rdquo;
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* School Full Name */}
        <Card className="min-h-[140px]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <Building2 className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">School Full Name</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isEditMode ? (
              <Input
                value={schoolData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Enter school full name"
                className="w-full"
              />
            ) : (
              <p className="text-base font-medium">{schoolData.fullName}</p>
            )}
          </CardContent>
        </Card>

        {/* Center Name */}
        <Card className="min-h-[140px]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-green-500 to-green-600 text-white">
                <Info className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">Center Name</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isEditMode ? (
              <Input
                value={schoolData.centerName}
                onChange={(e) =>
                  handleInputChange("centerName", e.target.value)
                }
                placeholder="Enter center name (e.g., MTSS005)"
                className="w-full"
              />
            ) : (
              <p className="text-base font-medium text-muted-foreground">
                {schoolData.centerName}
              </p>
            )}
          </CardContent>
        </Card>

        {/* School Type */}
        <Card className="min-h-[140px]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <School className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">School Type</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isEditMode ? (
              <div className="space-y-3">
                <Select
                  value={schoolData.schoolType}
                  onValueChange={(value: "government" | "private") =>
                    handleInputChange("schoolType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select school type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                {schoolData.schoolType === "government" && (
                  <Select
                    value={schoolData.governmentCategory || "national"}
                    onValueChange={(
                      value:
                        | "national"
                        | "district"
                        | "conventional"
                        | "CDSS"
                        | "mission"
                    ) => handleInputChange("governmentCategory", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select government category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national">National</SelectItem>
                      <SelectItem value="district">District</SelectItem>
                      <SelectItem value="conventional">Conventional</SelectItem>
                      <SelectItem value="CDSS">CDSS</SelectItem>
                      <SelectItem value="mission">Mission</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-base font-medium capitalize">
                  {schoolData.schoolType}
                </p>
                {schoolData.schoolType === "government" &&
                  schoolData.governmentCategory && (
                    <p className="text-sm text-muted-foreground capitalize">
                      {schoolData.governmentCategory}
                    </p>
                  )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Year Established */}
        <Card className="min-h-[140px]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-red-500 to-red-600 text-white">
                <Calendar className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">Year Established</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isEditMode ? (
              <Input
                type="text"
                value={schoolData.yearEstablished}
                onChange={(e) =>
                  handleInputChange("yearEstablished", e.target.value)
                }
                placeholder="Enter year established"
                className="w-full"
              />
            ) : (
              <p className="text-base font-medium">
                {schoolData.yearEstablished}
              </p>
            )}
          </CardContent>
        </Card>

        {/* School Motto */}
        <Card className="md:col-span-2 min-h-[140px]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                <Quote className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">School Motto</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isEditMode ? (
              <Textarea
                value={schoolData.motto}
                onChange={(e) => handleInputChange("motto", e.target.value)}
                placeholder="Enter school motto"
                rows={2}
                className="w-full"
              />
            ) : (
              <p className="text-base font-medium italic text-center py-2">
                &ldquo;{schoolData.motto}&rdquo;
              </p>
            )}
          </CardContent>
        </Card>

        {/* Background Information */}
        <Card className="md:col-span-2 min-h-[200px]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                <Info className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">
                Background Information
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Historical background and school information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditMode ? (
              <Textarea
                value={schoolData.backgroundInfo}
                onChange={(e) =>
                  handleInputChange("backgroundInfo", e.target.value)
                }
                placeholder="Enter background information about the school"
                rows={5}
                className="w-full"
              />
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {schoolData.backgroundInfo}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {isEditMode && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
