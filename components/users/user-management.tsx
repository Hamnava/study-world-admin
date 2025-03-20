"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserDialog } from "@/components/users/user-dialog";
import { authFetcher } from "@/lib/auth-fetcher";
import { Metadata, User } from "@/lib/types/response-types";

import { Loader2, MoreHorizontal, Plus, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export interface UserApiResponse {
  success: boolean;
  message: string;
  statusCode: number;
  metaData: Metadata;
  data: User[];
}

export function UserManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)

  const limit = 10;

  useEffect(() => {
    // Get query params from URL
    const search = searchParams.get("search") || "";
    const role = searchParams.get("roleFilter") || "all";
    const status = searchParams.get("status") || "all";
    const page = Number.parseInt(searchParams.get("page") || "1");

    setSearchQuery(search);
    setRoleFilter(role);
    setStatusFilter(status);
    setCurrentPage(page);

    fetchUsers(search, role, status, page);
  }, [searchParams]);

  const fetchUsers = async (
    search: string,
    role: string,
    status: string,
    page: number
  ) => {
    setIsLoading(true);
    try {
      // Build query params
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      };

      if (search) params.search = search;
      if (role !== "all") params.roleFilter = role;
      if (status !== "all") params.status = status;

      const response = await authFetcher.get<UserApiResponse>(
        "/admin/get-users",
        params
      );

      if (response.success && Array.isArray(response.data)) {
        setUsers(response.data);
        setTotalUsers(response.metaData?.count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      // Set demo data for preview
      setTotalUsers(3);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    updateQueryParams({
      search: debouncedSearch,
      page: "1",
    });
  }, [debouncedSearch]);

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    updateQueryParams({
      roleFilter: value,
      page: "1",
    });
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    updateQueryParams({
      status: value,
      page: "1",
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateQueryParams({
      page: page.toString(),
    });
  };

  const updateQueryParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    // Update or add new params
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    // Build the new URL with updated params
    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    router.push(newUrl);
  };

  const handleViewDetails = (userId: number) => {
    router.push(`/dashboard/users/${userId}`);
  };

  const handleCreateNewUser = () => {
    router.push('/dashboard/users/create-user')
  }

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const totalPages = Math.ceil(totalUsers / limit);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Button size="icon">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span>Showing</span>
          <span className="font-semibold">{totalUsers}</span>
          <span>users</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Verified</SelectItem>
              <SelectItem value="false">Unverified</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleCreateNewUser()}>
            <Plus className="mr-1 h-4 w-4 cursor-pointer" />
            Create User
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    {user.displayName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.roles.includes("admin")
                          ? "default"
                          : user.roles.includes("teacher")
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {user.roles.includes("admin")
                        ? "Admin"
                        : user.roles.includes("teacher")
                        ? "Teacher"
                        : "Student"}
                      {user.roles.length > 1 && " ..."}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isEmailVerified ? (
                      <Badge>Verified</Badge>
                    ) : (
                      <Badge variant="destructive">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 cursor-pointer"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleUserClick(user)}
                        >
                          Quick Access
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleViewDetails(user.id)}
                        >
                          More Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer"
                onClick={() => {
                  if (currentPage !== 1) {
                    handlePageChange(Math.max(1, currentPage - 1));
                  }
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  className="cursor-pointer"
                  isActive={currentPage === i + 1}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={
                  currentPage === totalPages
                    ? undefined
                    : () =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                className={
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <UserDialog
        user={selectedUser}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

    </div>
  );
}
