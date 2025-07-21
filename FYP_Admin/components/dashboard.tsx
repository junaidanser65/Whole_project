"use client";

import { useEffect, useState } from "react";
import { Users, Store, CheckCircle, Clock } from "lucide-react";
import { GradientCard } from "./ui/gradient-card";
import { StatsCard } from "./ui/stats-card";
import { getUsers } from "@/services/userService";
import { getVendors } from "@/services/vendorService"; // Adjust the path as needed
import { fetchAdminRecentActivity, fetchAdminMonthlyRevenue } from "@/services";

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
  const [recentActivity, setRecentActivity] = useState<any>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userRes = await getUsers();
        const vendorRes = await getVendors();

        // const users = Array.isArray(userRes) ? userRes : userRes.users || [];
        const users: any[] = Array.isArray(userRes)
          ? userRes
          : Array.isArray((userRes as any).users)
          ? (userRes as any).users
          : [];

        // const vendors = Array.isArray(vendorRes)
        //   ? vendorRes
        //   : vendorRes.vendors || [];

        const vendors: any[] = Array.isArray((vendorRes as any).vendors)
          ? (vendorRes as any).vendors
          : [];

        const [thisWeekStart, thisWeekEnd] = getWeekRange(0);
        const [lastWeekStart, lastWeekEnd] = getWeekRange(-1);

        const getCreatedAtDate = (entity: { created_at: string }) => new Date(entity.created_at);

        const usersThisWeek = users.filter((u: any) => {
          const date = getCreatedAtDate(u);
          return date >= thisWeekStart && date <= thisWeekEnd;
        });

        const usersLastWeek = users.filter((u: any) => {
          const date = getCreatedAtDate(u);
          return date >= lastWeekStart && date <= lastWeekEnd;
        });

        const vendorsThisWeek = vendors.filter((v: any) => {
          const date = getCreatedAtDate(v);
          return date >= thisWeekStart && date <= thisWeekEnd;
        });

        const vendorsLastWeek = vendors.filter((v: any) => {
          const date = getCreatedAtDate(v);
          return date >= lastWeekStart && date <= lastWeekEnd;
        });

        const verifiedVendors = vendors.filter(
          (v: any) => Number(v.is_verified) === 1
        );
        const verifiedThisWeek = verifiedVendors.filter((v: any) => {
          const date = getCreatedAtDate(v);
          return date >= thisWeekStart && date <= thisWeekEnd;
        });

        const verifiedLastWeek = verifiedVendors.filter((v: any) => {
          const date = getCreatedAtDate(v);
          return date >= lastWeekStart && date <= lastWeekEnd;
        });

        setUserCount(users.length);
        setVendorCount(vendors.length);
        setVerifiedVendorCount(verifiedVendors.length);
        setPendingVendorCount(
          vendors.filter((v: any) => Number(v.is_verified) === 0).length
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

    const fetchRecent = async () => {
      try {
        const data = await fetchAdminRecentActivity();
        setRecentActivity(data);
      } catch (err) {
        console.error("Failed to fetch recent activity", err);
      }
    };

    const fetchRevenue = async () => {
      try {
        const revenue = await fetchAdminMonthlyRevenue();
        setMonthlyRevenue(revenue);
      } catch (err) {
        console.error("Failed to fetch monthly revenue", err);
      }
    };

    fetchStats();
    fetchRecent();
    fetchRevenue();
  }, []);
  const stats = [
    {
      title: "Total Users",
      value: userCount.toLocaleString(),
      icon: Users,
      change: `${userChange > 0 ? "+" : ""}${userChange}%`,
      changeType: (userChange >= 0 ? "positive" : "negative") as "positive" | "negative",
    },
    {
      title: "Total Vendors",
      value: vendorCount.toLocaleString(),
      icon: Store,
      change: `${vendorChange > 0 ? "+" : ""}${vendorChange}%`,
      changeType: (vendorChange >= 0 ? "positive" : "negative") as "positive" | "negative",
    },
    {
      title: "Verified Vendors",
      value: verifiedVendorCount.toLocaleString(),
      icon: CheckCircle,
      change: `${verifiedVendorChange > 0 ? "+" : ""}${verifiedVendorChange}%`,
      changeType:
        (verifiedVendorChange >= 0 ? "positive" : "negative") as "positive" | "negative",
    },
    {
      title: "Pending Verification",
      value: pendingVendorCount.toLocaleString(),
      icon: Clock,
      change: "0%", // optional: could show change if tracking verification delays
      changeType: "positive" as "positive",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Monthly Revenue Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="col-span-1 md:col-span-2 lg:col-span-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 flex flex-col items-center justify-center shadow-lg">
            <div className="text-white text-lg font-semibold mb-2">Monthly Bookings Revenue</div>
            <div className="text-3xl font-bold text-white">
              {monthlyRevenue !== null ? `$${monthlyRevenue.toLocaleString()}` : 'Loading...'}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GradientCard>
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity ? (
              <>
                {recentActivity.recentUsers && recentActivity.recentUsers.length > 0 && (
                  <div>
                    <div className="font-semibold mb-1">New Users</div>
                    {recentActivity.recentUsers.map((user: any) => (
                      <div key={user.id} className="flex items-center gap-3 p-2 bg-white/50 rounded-lg text-sm">
                        <span className="h-2 w-2 bg-blue-500 rounded-full inline-block"></span>
                        {user.name} ({user.email}) joined on {new Date(user.created_at).toLocaleString()}
                      </div>
                    ))}
                  </div>
                )}
                {recentActivity.recentVendors && recentActivity.recentVendors.length > 0 && (
                  <div className="mt-2">
                    <div className="font-semibold mb-1">New Vendors</div>
                    {recentActivity.recentVendors.map((vendor: any) => (
                      <div key={vendor.id} className="flex items-center gap-3 p-2 bg-white/50 rounded-lg text-sm">
                        <span className="h-2 w-2 bg-green-500 rounded-full inline-block"></span>
                        {vendor.business_name || vendor.name} ({vendor.email}) registered on {new Date(vendor.created_at).toLocaleString()} {vendor.is_verified ? '(Verified)' : '(Pending)'}
                      </div>
                    ))}
                  </div>
                )}
                {recentActivity.recentBookings && recentActivity.recentBookings.length > 0 && (
                  <div className="mt-2">
                    <div className="font-semibold mb-1">Recent Bookings</div>
                    {recentActivity.recentBookings.map((booking: any) => (
                      <div key={booking.id} className="flex items-center gap-3 p-2 bg-white/50 rounded-lg text-sm">
                        <span className="h-2 w-2 bg-yellow-500 rounded-full inline-block"></span>
                        Booking #{booking.id} by {booking.user_name} with {booking.vendor_name} on {booking.booking_date} at {booking.booking_time} ({booking.status})
                      </div>
                    ))}
                  </div>
                )}
                {recentActivity.recentReviews && recentActivity.recentReviews.length > 0 && (
                  <div className="mt-2">
                    <div className="font-semibold mb-1">Recent Reviews</div>
                    {recentActivity.recentReviews.map((review: any) => (
                      <div key={review.id} className="flex items-center gap-3 p-2 bg-white/50 rounded-lg text-sm">
                        <span className="h-2 w-2 bg-purple-500 rounded-full inline-block"></span>
                        {review.user_name} reviewed {review.vendor_name}: {review.rating}★ "{review.comment}" on {new Date(review.created_at).toLocaleString()}
                      </div>
                    ))}
                  </div>
                )}
                {recentActivity.recentTransactions && recentActivity.recentTransactions.length > 0 && (
                  <div className="mt-2">
                    <div className="font-semibold mb-1">Recent Transactions</div>
                    {recentActivity.recentTransactions.map((txn: any) => (
                      <div key={txn.id} className="flex items-center gap-3 p-2 bg-white/50 rounded-lg text-sm">
                        <span className="h-2 w-2 bg-pink-500 rounded-full inline-block"></span>
                        Transaction #{txn.id}: {txn.user_name} booked {txn.vendor_name} for {txn.total_amount} on {txn.booking_date} at {txn.booking_time} (Completed)
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500">Loading recent activity...</div>
            )}
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
