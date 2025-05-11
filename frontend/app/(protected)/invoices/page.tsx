"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // Add this import
import {
  QrCode,
  Search,
  CalendarIcon,
  ChevronDown,
  Loader2,
  PlusCircle,
  FileText,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { collection, onSnapshot, query, where } from "firebase/firestore"; // Add where
import { db } from "@/config/firebase";
import Link from "next/link";
import { Invoice } from "@/types/types";
import QRCodeModal from "@/components/common/qr-code-modal";

export default function InvoicesPage() {
  // Get URL search params
  const searchParams = useSearchParams();
  const router = useRouter();

  // Use URL status parameter or default to "all"
  const statusFromUrl = searchParams.get("status") || "all";

  // State for filters - initialize statusFilter from URL
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusFromUrl);

  // State for QR code modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // State for invoice data
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Update URL when status filter changes
  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);

    // Update the URL to reflect the filter
    if (newStatus === "all") {
      // Remove the status param if set to "all"
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("status");
      router.push(
        `/invoices${newParams.toString() ? `?${newParams.toString()}` : ""}`
      );
    } else {
      // Set the status param
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("status", newStatus);
      router.push(`/invoices?${newParams.toString()}`);
    }
  };

  // Fetch invoices from Firestore
  useEffect(() => {
    setIsLoading(true);

    // Create a reference to the invoices collection
    const invoicesRef = collection(db, "invoices");

    // Build the query - add filtering if status is specified in URL
    let firestoreQuery = query(invoicesRef);

    // Only add where clause for specific status filters
    if (statusFilter !== "all") {
      firestoreQuery = query(invoicesRef, where("status", "==", statusFilter));
    }

    // Set up the real-time listener with the constructed query
    const unsubscribe = onSnapshot(
      firestoreQuery,
      (querySnapshot) => {
        const invoicesData: Invoice[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // Convert Firestore timestamp to Date object if necessary
          const dueDate =
            data.dueDate instanceof Date
              ? data.dueDate
              : data.dueDate?.toDate
              ? data.dueDate.toDate()
              : new Date(data.dueDate);

          const paidAt = data.paidAt
            ? data.paidAt instanceof Date
              ? data.paidAt
              : data.paidAt?.toDate
              ? data.paidAt.toDate()
              : new Date(data.paidAt)
            : undefined;

          invoicesData.push({
            id: doc.id,
            invoiceNumber: data.invoiceNumber,
            customerName: data.customerName,
            amount: parseFloat(data.amount),
            dueDate: dueDate,
            status: data.status,
            paymentLink: `${window.location.origin}/pay/${data.invoiceNumber}`,
            merchantId: data.merchantId,
            merchantName: data.merchantName,
            merchantAddress: data.merchantAddress,
            paidAt: paidAt,
          });
        });

        setInvoices(invoicesData);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error listening to invoices:", error);
        setError("Failed to load invoices. Please try again later.");
        setIsLoading(false);
      }
    );

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [statusFilter]); // Add statusFilter as a dependency so the query updates when it changes

  // Filter invoices based on search and date (status is already filtered by Firestore query)
  const filteredInvoices = invoices.filter((invoice) => {
    // Search filter
    const matchesSearch =
      invoice.invoiceNumber
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      invoice.customerName?.toLowerCase().includes(searchQuery.toLowerCase());

    // Date filter
    const matchesDate = dateFilter
      ? format(invoice.dueDate, "yyyy-MM-dd") === dateFilter
      : true;

    // Status is already filtered by the Firestore query
    return matchesSearch && matchesDate;
  });

  // Handle QR code click
  const handleQrCodeClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  // Handle copy to clipboard
  const handleCopyLink = () => {
    if (selectedInvoice) {
      navigator.clipboard.writeText(selectedInvoice.paymentLink);
      // add a toast notification here
      alert("Payment link copied to clipboard");
    }
  };

  // Handle share
  const handleShare = async () => {
    if (selectedInvoice && navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${selectedInvoice.invoiceNumber}`,
          text: `Payment link for invoice ${selectedInvoice.invoiceNumber}`,
          url: selectedInvoice.paymentLink,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // Fallback if Web Share API is not available
      handleCopyLink();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading invoices...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {statusFilter !== "all"
            ? `${
                statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)
              } Invoices`
            : "All Invoices"}
        </h1>
        <Link
          href="/invoices/create"
          className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-sm"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Invoice
        </Link>
      </div>

      {/* Filters section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Date filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="date"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        {/* Status filter - updated to use handleStatusChange */}
        <div className="relative">
          <select
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 appearance-none"
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Loading and error states remain the same */}
      {isLoading && (
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* No invoices state - updated to handle filtered states */}
      {!isLoading && !error && invoices.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-50 flex items-center justify-center rounded-full mb-4">
            <FileText className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFilter !== "all"
              ? `No ${statusFilter} invoices found`
              : "No invoices yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {statusFilter !== "all"
              ? `Try selecting a different status filter or create new invoices.`
              : "Start creating invoices to keep track of your payments and get paid faster."}
          </p>
          {statusFilter !== "all" ? (
            <button
              onClick={() => handleStatusChange("all")}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition shadow-sm mr-3"
            >
              View All Invoices
            </button>
          ) : null}
          <Link
            href="/invoices/create"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-sm"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create {statusFilter === "all" ? "Your First " : "New "} Invoice
          </Link>
        </div>
      )}

      {/* Invoices table - remains mostly the same */}
      {!isLoading && !error && invoices.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Invoice ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Due Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="bg-white border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4">{invoice.customerName}</td>
                    <td className="px-6 py-4">${invoice.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleQrCodeClick(invoice)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Show QR Code"
                      >
                        <QrCode className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white">
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No invoices found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Code Modal */}
      {isModalOpen && selectedInvoice && (
        <QRCodeModal
          onClose={() => setIsModalOpen(false)}
          invoice={selectedInvoice}
          onCopyLink={handleCopyLink}
          onShare={handleShare}
        />
      )}
    </div>
  );
}
