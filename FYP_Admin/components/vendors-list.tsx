"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Check,
  X,
} from "lucide-react";
import { GradientCard } from "./ui/gradient-card";
import { GradientButton } from "./ui/gradient-button";
import { Badge } from "./ui/badge";
import {
  getVendors,
  updateVendorVerification,
  Vendor,
} from "@/services/vendorService";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function VendorsList() {
  const [searchTerm, setSearchTerm] = useState("");
const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getVendors();
      console.log("Fetched vendors:", data);
    setVendors(Array.isArray(data.vendors) ? data.vendors : []);
    } catch (err) {
      console.error("Error fetching vendors", err);
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, []);


  const handleVerifyVendor = async (vendorId: number) => {
    try {
      await updateVendorVerification(vendorId, true);
      setVendors((prev) =>
        prev.map((vendor) =>
          vendor.id === vendorId ? { ...vendor, is_verified: true } : vendor
        )
      );
    } catch (err) {
      console.error("Error verifying vendor", err);
    }
  };

 const handleRejectVendor = async (vendorId: number) => {
   try {
     await updateVendorVerification(vendorId, false);
     setVendors((prev) =>
       prev.map((vendor) =>
         vendor.id === vendorId ? { ...vendor, is_verified: false } : vendor
       )
     );
   } catch (err) {
     console.error("Error rejecting vendor", err);
   }
 };

// const filteredVendors =
//   vendors?.filter(
//     (vendor) =>
//       vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
//   ) || [];


  const exportToExcel = () => {
  const exportData = vendors.map((vendor) => ({
    ID: vendor.id,
    Name: vendor.name,
    Email: vendor.email,
    Phone: vendor.phone_number,
    Address: vendor.address,
    "Business Name": vendor.business_name,
    "Join Date": vendor.created_at?.split("T")[0] || "",
    Status: Number(vendor.is_verified) === 1 ? "Verified" : "Pending",
  }));


    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, `Users_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };




  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
          Vendors Management
        </h2>
        <GradientButton onClick={exportToExcel}>Export Vendors</GradientButton>
      </div>

      <GradientCard>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
            />
          </div>
          {/* <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            Filter
          </button> */}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold">Vendor</th>
                <th className="text-left py-3 px-4 font-semibold">Contact</th>
                {/* <th className="text-left py-3 px-4 font-semibold">Location</th> */}
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Join Date</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={"/placeholder.svg"}
                        alt={vendor.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium">{vendor.name}</div>
                        <div className="text-sm text-gray-500">
                          {vendor.business_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-gray-400" />
                        {vendor.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {vendor.phone_number}
                      </div>
                    </div>
                  </td>
                  {/* <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {vendor.address}
                    </div>
                  </td> */}
                  <td className="py-4 px-4">
                    <Badge variant={vendor.is_verified ? "success" : "warning"}>
                      {vendor.is_verified ? "verified" : "pending"}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {new Date(vendor.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {vendor.is_verified ? (
                        // If vendor is verified, show Reject button
                        <button
                          onClick={() => handleRejectVendor(vendor.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject Vendor"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : (
                        // If vendor is not verified, show Verify button
                        <button
                          onClick={() => handleVerifyVendor(vendor.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Verify Vendor"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}

                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GradientCard>
    </div>
  );
}
