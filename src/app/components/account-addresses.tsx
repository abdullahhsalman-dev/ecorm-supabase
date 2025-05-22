"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/src/app/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/app/components/ui/card";
import { createClient } from "@/src/app/lib/supabase/client";
import { useAuth } from "@/src/app/components/auth-provider";
import { getDummyAddresses } from "@/src/app/lib/dummy-data";
import { log } from "node:console";

export function AccountAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAddresses() {
      console.log("Fetching addresses for user:", getDummyAddresses);

      if (!user) {
        // Use dummy data if no user
        setAddresses(getDummyAddresses());
        setLoading(false);
        return;
      }

      const supabase = createClient();

      try {
        const { data, error } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false });

        if (error) {
          console.error("Error fetching addresses:", error);
          // Use dummy data on error
          setAddresses(getDummyAddresses());
          return;
        }

        if (data && data.length > 0) {
          setAddresses(data);
        } else {
          // No data found, use dummy data
          setAddresses(getDummyAddresses());
        }
      } catch (error) {
        console.error("Error in fetchAddresses:", error);
        // Use dummy data on error
        setAddresses(getDummyAddresses());
      } finally {
        setLoading(false);
      }
    }

    fetchAddresses();
  }, [user]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array(2)
          .fill(null)
          .map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border bg-card p-6"
            >
              <div className="mb-4 h-6 w-1/2 rounded bg-muted"></div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-muted"></div>
                <div className="h-4 w-3/4 rounded bg-muted"></div>
                <div className="h-4 w-1/2 rounded bg-muted"></div>
              </div>
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">Your Addresses</h3>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Address
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address: any) => (
          <Card key={address.id}>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                {address.name}
                {address.is_default && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Default
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <address className="not-italic text-muted-foreground">
                {address.street_address}
                <br />
                {address.city}, {address.state} {address.postal_code}
                <br />
                {address.country}
                <br />
                Phone: {address.phone}
              </address>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" size="sm">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
