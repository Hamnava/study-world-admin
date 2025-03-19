import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Login - StudyWorld Admin",
  description: "Login to StudyWorld Admin Dashboard",
};

export default async function LoginPage() {
  const session = await auth();

  const user = session?.user.accessToken;
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-primary" />
        <div>
          <div className="relative z-20 flex justify-center items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            StudyWorld Admin
          </div>

         
        </div>
        <div className="relative flex flex-1 items-center justify-center">
            <Image
              src="/assets/authentication.png"
              alt="Login image"
              width={400}
              height={500}
              className="w-[80%] md:w-[75%] lg:w-[75%] xl:w-[75%] h-auto"
            />
          </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This platform has revolutionized how we manage our
              educational resources and users.&rdquo;
            </p>
            <footer className="text-sm">Hamnava - Platform developer</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Admin Login
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the admin dashboard
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
