import React, { useState } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UserRole } from "@/types";

const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email")
    .refine((email) => email.endsWith("@college.edu"), {
      message: "Please use your college email address",
    }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Create properly structured JWT token for testing without backend validation
const generateToken = (userId: string, role: UserRole) => {
  // This creates a valid JWT structure (header.payload.signature)
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      id: userId,
      email: role === "admin" ? "admin@college.edu" : "student@college.edu",
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days expiry
    })
  );
  const signature = btoa("mock-signature"); // We don't need real signature for test environment

  return `${header}.${payload}.${signature}`;
};

// Direct login function with hard-coded users for development
const directLogin = (email: string, password: string, role: UserRole) => {
  // Specific users with their credentials and details
  const users = {
    admin: {
      id: "admin123",
      email: "admin@college.edu",
      password: "password123",
      role: "admin" as UserRole,
      name: "Admin User",
      department: "Computer Science",
      position: "Department Head"
    },
    student: {
      id: "student456",
      email: "student@college.edu",
      password: "password123",
      role: "student" as UserRole,
      name: "John Student",
      rollNumber: "CS21001",
      course: "B.Tech",
      year: "3"
    }
  };
  
  const targetUser = role === "admin" ? users.admin : users.student;
  
  if (email === targetUser.email && password === targetUser.password) {
    const token = generateToken(targetUser.id, targetUser.role);
    
    // Return complete user object for storage
    return {
      success: true,
      token,
      user: targetUser
    };
  }
  
  return { success: false };
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const role = searchParams.get("role") as UserRole;

  // If no role is specified, redirect to home page
  if (!role) {
    return <Navigate to="/" />;
  }

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      // Direct login without API call
      const response = directLogin(data.email, data.password, role as UserRole);

      if (response.success) {
        // Store the token in localStorage with Bearer prefix
        localStorage.setItem("authToken", `Bearer ${response.token}`);
        localStorage.setItem("user", JSON.stringify(response.user));

        // Update auth context state
        await login(data.email, data.password, role);

        toast.success("Login successful");
        navigate(role === "admin" ? "/admin" : "/dashboard");
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {role === "admin" ? "Admin Login" : "Student Login"}
          </CardTitle>
          <CardDescription className="text-center">
            Enter your college email to access the internship portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="yourname@college.edu"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="******" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-gray-500">
            <p>Demo Credentials:</p>
            <p>Student: student@college.edu / password123</p>
            <p>Admin: admin@college.edu / password123</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
