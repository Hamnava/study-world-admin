"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Copy, RefreshCw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

import { authFetcher } from "@/lib/auth-fetcher";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { generateStrongPassword } from "@/lib/utils"

const formSchema = z.object({
 
  firstName: z
    .string()
    .min(2, { message: "First Name must be at least 3 characters" }),

  lastName: z
    .string()
    .min(2, { message: "Last Name must be at least 2 characters" }),

  email: z.string().email({ message: "Invalid email address" }),

  password: z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(32, "Password cannot be longer than 32 characters")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/\d/, "Password must include at least one number")
  .regex(/[@$!%*?&]/, "Password must include at least one special character (@, $, !, %, *, ?, &)")

});


export default function CreateUserPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  })

  const password = watch("password")

  const generatePassword = () => {
   const newPassword = generateStrongPassword();

    // Set the password in the form
    setValue("password", newPassword, { shouldValidate: true })
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(password)
    toast.success("The password has been copied to your clipboard.")
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const response = await authFetcher.post("/auth/signup", values);

      // Ensure response is successful
      if (!response.success) {
        throw new Error("Failed to create user");
      }

      // Reset the form
      reset()

      toast.success(`User ${values.firstName} ${values.lastName} has been created successfully.`)
    } catch (error) {
      console.error("There was an error creating the user. Please try again.:", error);
      toast.error("There was an error creating the user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <Button variant="ghost" className="mb-6 cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Users
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
          <CardDescription>Fill in the details to create a new user account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                    id="firstName"
                    {...register("firstName")}
                    placeholder="First name"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                    id="lastName"
                    {...register("lastName")}
                    placeholder="Last name"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                    id="email"
                    {...register("email")}
                    placeholder="Email Address"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="flex gap-2">
              <Input
                    id="password"
                    {...register("password")}
                    placeholder="Password"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={generatePassword}
                  title="Generate password"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={copyPassword}
                  title="Copy password"
                  disabled={!password}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Password should contain at least one uppercase letter, one lowercase letter, one number, and one special
                character.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin cursor-pointer" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

