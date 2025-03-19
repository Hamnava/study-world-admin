"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { UpdateUserResponse } from "@/lib/types/response-types";
import { authFetcher } from "@/lib/auth-fetcher";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { axiosV1 } from "@/config/axios-config";

const formSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "Display Name must be at least 5 characters" }),
  firstName: z
    .string()
    .min(2, { message: "First Name must be at least 3 characters" }),
  lastName: z
    .string()
    .min(2, { message: "Last Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  profilePicture: z.string().optional(),
});

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: session?.user?.displayName || "",
      email: session?.user?.email || "",
      profilePicture: session?.user?.profilePicture || "",
    },
  });

  useEffect(() => {
    if (session?.user) {
      setValue("displayName", session.user.displayName || "");
      setValue("firstName", session.user.firstName || "");
      setValue("lastName", session.user.lastName || "");
      setValue("email", session.user.email || "");
      setValue("profilePicture", session.user.profilePicture || "");

      if (session.user.profilePicture) {
        setImagePreview(session.user.profilePicture);
      }
    }
  }, [session, setValue]);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    return nameParts.length > 1
      ? (
          nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
        ).toUpperCase()
      : nameParts[0].charAt(0).toUpperCase();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axiosV1.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success && response.data.data.url) {
        const result = await authFetcher.patch("/user/update-profile", {
          assetId: response.data.data.id,
        });

        // Update session
        await update({
          ...session,
          user: {
            ...session?.user,
            profilePicture: response.data.data.url,
          },
        });
      }

      toast.success("Profile picture uploaded successfully!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const { profilePicture, ...payload } = values;

      console.log(profilePicture);
      const response = await authFetcher.patch<
        UpdateUserResponse,
        z.infer<typeof formSchema>
      >("/user/update", payload);

      // Ensure response is successful
      if (!response.success) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = response.data;

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          ...updatedUser,
        },
      });

      toast.success("Your profile has been updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal information and profile picture
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-x-18">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  {imagePreview ? (
                    <AvatarImage src={imagePreview} alt="Profile Picture" />
                  ) : (
                    <AvatarFallback className="text-2xl">
                      {getInitials(watch("displayName"))}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex flex-col items-center">
                  <Label htmlFor="profile-picture" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Upload className="h-4 w-4" />
                      Change Picture
                    </div>
                  </Label>
                  <Input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                 
                </div>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    placeholder="Your first name"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    placeholder="Your last name"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    {...register("displayName")}
                    placeholder="Your display name"
                  />
                  {errors.displayName && (
                    <p className="text-sm text-red-500">
                      {errors.displayName.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    {...register("email")}
                    type="email"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Your email address cannot be changed
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
