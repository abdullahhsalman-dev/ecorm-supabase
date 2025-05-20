"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { AccountOrders } from "@/components/account-orders";
import { AccountAddresses } from "@/components/account-addresses";
import { AccountWishlist } from "@/components/account-wishlist";

export default function AccountPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // Profile form state
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: user?.user_metadata?.phone || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    // Simulate API call for profile update
    setTimeout(() => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      setIsUpdating(false);
    }, 1000);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  if (!user) {
    return (
      <div className="container flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold">Account Access</h1>
        <p className="mb-8 text-muted-foreground">
          Please sign in to access your account.
        </p>
        <Button onClick={() => router.push("/login")}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold">My Account</h1>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="w-full justify-start border-b pb-px">
          <TabsTrigger value="profile" className="rounded-b-none">
            Profile
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-b-none">
            Orders
          </TabsTrigger>
          <TabsTrigger value="addresses" className="rounded-b-none">
            Addresses
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="rounded-b-none">
            Wishlist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-6 text-xl font-semibold">Personal Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-6 text-xl font-semibold">Change Password</h2>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                  />
                </div>
                <div></div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                  />
                </div>
              </div>
              <Button type="submit">Change Password</Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <AccountOrders />
        </TabsContent>

        <TabsContent value="addresses">
          <AccountAddresses />
        </TabsContent>

        <TabsContent value="wishlist">
          <AccountWishlist />
        </TabsContent>
      </Tabs>
    </div>
  );
}
