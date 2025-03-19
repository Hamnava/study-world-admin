"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { authFetcher } from "@/lib/auth-fetcher";
import { UserDetails } from "@/lib/types/response-types";

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingTeacher, setUpdatingTeacher] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await authFetcher.get<UserDetails>(
          `/admin/get-user/${params.id}`
        );

        if (response.success && response.data) {
          setUser(response.data);
        } else {
          toast.error("Failed to fetch user details");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [params.id]);

  const handleEmailVerificationToggle = async (verified: boolean) => {
    if (!user) return;

    setUpdatingEmail(true);
    try {
      const response = await authFetcher.patch("/admin/update-verification", {
        userId: user.id,
        isVerify: verified,
      });

      if (response.success) {
        setUser({
          ...user,
          isEmailVerified: verified,
        });

        toast.success(
          `User email ${verified ? "verified" : "unverified"} successfully`
        );
      }
    } catch (error) {
      toast.error("Failed to update email verification status");
      console.log(error);
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleTeacherApprovalToggle = async (approved: boolean) => {
    if (!user || !user.teacherInfo) return;

    setUpdatingTeacher(true);
    try {
      const response = await authFetcher.patch("/admin/approve-teacher", {
        teacherId: user.teacherInfo.id,
        isApproved: approved,
      });
      if (response.success) {
        setUser({
          ...user,
          teacherInfo: {
            ...user.teacherInfo,
            isApproved: approved,
          },
        });
        toast.success(
          `Teacher information ${
            approved ? "approved" : "disapproved"
          } successfully`
        );
      }
    } catch (error) {
      toast.error("Failed to update teacher approval status");
      console.log(error);
    } finally {
      setUpdatingTeacher(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">User not found</h1>
        <Button className="cursor-pointer" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mr-4 cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">User Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>User profile and account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID</p>
                <p>{user.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Document ID
                </p>
                <p className="truncate">{user.documentId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  First Name
                </p>
                <p>{user.firstName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Last Name
                </p>
                <p>{user.lastName}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Display Name
              </p>
              <p>{user.displayName}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Username
              </p>
              <p>{user.username}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <div className="flex items-center gap-2">
                <p>{user.email}</p>
                <Badge
                  variant={user.isEmailVerified ? "default" : "destructive"}
                >
                  {user.isEmailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p>{new Date(user.createdAt).toLocaleString()}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Roles</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {user.roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Email Verification</p>
                <p className="text-sm text-muted-foreground">
                  {user.isEmailVerified
                    ? "User email is verified"
                    : "User email is not verified"}
                </p>
              </div>
              <div className="flex items-center">
                {updatingEmail ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Switch
                    checked={user.isEmailVerified}
                    onCheckedChange={handleEmailVerificationToggle}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {user.teacherInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Teacher Information</CardTitle>
              <CardDescription>
                Teaching qualifications and experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Phone Number
                </p>
                <p>{user.teacherInfo.phoneNumber}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Resume
                </p>
                <div className="flex items-center gap-2">
                  <p>
                  <a
                    href={user.teacherInfo.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    Preview
                  </a>
                  <a
                    href={user.teacherInfo.resume}
                    download
                    target="_blank"
                    className="px-2 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600"
                  >
                    Download
                  </a>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Education Level
                  </p>
                  <p>{user.teacherInfo.educationLevel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Graduation Year
                  </p>
                  <p>{user.teacherInfo.graduationYear}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Teaching Experience
                </p>
                <p>{user.teacherInfo.teachingExperience} years</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Teaching Specialty
                </p>
                <p>{user.teacherInfo.teachingSpecialty.name}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Teacher Approval</p>
                  <p className="text-sm text-muted-foreground">
                    {user.teacherInfo.isApproved
                      ? "Teacher information is approved"
                      : "Teacher information is not approved"}
                  </p>
                </div>
                <div className="flex items-center">
                  {updatingTeacher ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Switch
                      checked={user.teacherInfo.isApproved}
                      onCheckedChange={handleTeacherApprovalToggle}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {user.studentCategories && user.studentCategories.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Student Categories</CardTitle>
              <CardDescription>
                Subject categories the user is interested in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.studentCategories.map((category) => (
                  <Badge key={category.id} variant="outline">
                    {category.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
