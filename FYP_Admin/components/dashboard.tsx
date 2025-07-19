"use client";

import { useEffect, useState } from "react";
import { Users, Store, CheckCircle, Clock } from "lucide-react";
import { GradientCard } from "./ui/gradient-card";
import { StatsCard } from "./ui/stats-card";
import { getUsers } from "@/services/userService";
import { getVendors } from "@/services/vendorService"; // Adjust the path as needed

const getWeekRange = (offset = 0) => {
  const now = new Date();
  const firstDayOfWeek = new Date(now);
  firstDayOfWeek.setDate(now.getDate() - now.getDay() + 1 + offset * 7); // Monday
  firstDayOfWeek.setHours(0, 0, 0, 0);

  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
  lastDayOfWeek.setHours(23, 59, 59, 999);

  return [firstDayOfWeek, lastDayOfWeek];
};

const calculateChangePercent = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export function Dashboard() {
  const [userCount, setUserCount] = useState(0);
  const [vendorCount, setVendorCount] = useState(0);
  const [verifiedVendorCount, setVerifiedVendorCount] = useState(0);
  const [pendingVendorCount, setPendingVendorCount] = useState(0);

  const [userChange, setUserChange] = useState(0);
  const [vendorChange, setVendorChange] = useState(0);
  const [verifiedVendorChange, setVerifiedVendorChange] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userRes = await getUsers();
        const vendorRes = await getVendors();

        // const users = Array.isArray(userRes) ? userRes : userRes.users || [];
        const users = Array.isArray(userRes)
          ? userRes
          : Array.isArray(userRes.users)
          ? userRes.users
          : [];

        // const vendors = Array.isArray(vendorRes)
        //   ? vendorRes
        //   : vendorRes.vendors || [];

        const vendors = Array.isArray(vendorRes.vendors)
          ? vendorRes.vendors
          : [];

        const [thisWeekStart, thisWeekEnd] = getWeekRange(0);
        const [lastWeekStart, lastWeekEnd] = getWeekRange(-1);

        const getCreatedAtDate = (entity: any) => new Date(entity.created_at);

        const usersThisWeek = users.filter((u) => {
          const date = getCreatedAtDate(u);
          return date >= thisWeekStart && date <= thisWeekEnd;
        });

        const usersLastWeek = users.filter((u) => {
          const date = getCreatedAtDate(u);
          return date >= lastWeekStart && date <= lastWeekEnd;
        });

        const vendorsThisWeek = vendors.filter((v) => {
          const date = getCreatedAtDate(v);
          return date >= thisWeekStart && date <= thisWeekEnd;
        });

        const vendorsLastWeek = vendors.filter((v) => {
          const date = getCreatedAtDate(v);
          return date >= lastWeekStart && date <= lastWeekEnd;
        });

        const verifiedVendors = vendors.filter(
          (v) => Number(v.is_verified) === 1
        );
        const verifiedThisWeek = verifiedVendors.filter((v) => {
          const date = getCreatedAtDate(v);
          return date >= thisWeekStart && date <= thisWeekEnd;
        });

        const verifiedLastWeek = verifiedVendors.filter((v) => {
          const date = getCreatedAtDate(v);
          return date >= lastWeekStart && date <= lastWeekEnd;
        });

        setUserCount(users.length);
        setVendorCount(vendors.length);
        setVerifiedVendorCount(verifiedVendors.length);
        setPendingVendorCount(
          vendors.filter((v) => Number(v.is_verified) === 0).length
        );

        // Set dynamic change %
        setUserChange(
          calculateChangePercent(usersThisWeek.length, usersLastWeek.length)
        );
        setVendorChange(
          calculateChangePercent(vendorsThisWeek.length, vendorsLastWeek.length)
        );
        setVerifiedVendorChange(
          calculateChangePercent(
            verifiedThisWeek.length,
            verifiedLastWeek.length
          )
        );
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };

    fetchStats();
  }, []);
  const stats = [
    {
      title: "Total Users",
      value: userCount.toLocaleString(),
      icon: Users,
      change: `${userChange > 0 ? "+" : ""}${userChange}%`,
      changeType: userChange >= 0 ? "positive" : ("negative" as const),
    },
    {
      title: "Total Vendors",
      value: vendorCount.toLocaleString(),
      icon: Store,
      change: `${vendorChange > 0 ? "+" : ""}${vendorChange}%`,
      changeType: vendorChange >= 0 ? "positive" : ("negative" as const),
    },
    {
      title: "Verified Vendors",
      value: verifiedVendorCount.toLocaleString(),
      icon: CheckCircle,
      change: `${verifiedVendorChange > 0 ? "+" : ""}${verifiedVendorChange}%`,
      changeType:
        verifiedVendorChange >= 0 ? "positive" : ("negative" as const),
    },
    {
      title: "Pending Verification",
      value: pendingVendorCount.toLocaleString(),
      icon: Clock,
      change: "", // optional: could show change if tracking verification delays
      changeType: "neutral" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GradientCard>
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">
                New vendor registration: Pizza Palace
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">User John Doe updated profile</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">
                Vendor verification pending: Taco Truck
              </span>
            </div>
          </div>
        </GradientCard>

        <GradientCard>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full p-3 bg-white/50 rounded-lg text-left hover:bg-white/70 transition-colors">
              Review Pending Vendors
            </button>
            <button className="w-full p-3 bg-white/50 rounded-lg text-left hover:bg-white/70 transition-colors">
              Export User Data
            </button>
            <button className="w-full p-3 bg-white/50 rounded-lg text-left hover:bg-white/70 transition-colors">
              Send Notifications
            </button>
          </div>
        </GradientCard>
      </div>
    </div>
  );
}
