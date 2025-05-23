"use client";

import { useState, useEffect } from "react";
import { subDays, startOfMonth, endOfMonth } from "date-fns";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db, auth } from "@/config/firebase";
import { CurrencyData, Invoice } from "@/types/types";
import {
  CalendarIcon,
  ChevronDown,
  AlertCircle,
  Loader2,
  DollarSign,
  FileText,
  Clock,
  BadgePercent,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import countryCurrencyMapping from "@/constants/country_currency_mapping.json";
import Image from "next/image";
import { convertFromUsdc } from "@/utils";

export default function AnalyticsPage() {
  const router = useRouter();

  // State for date range filter
  const [dateRange, setDateRange] = useState("last30days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);

  // State for invoice data
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Derived state for analytics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paidInvoices, setPaidInvoices] = useState(0);
  const [pendingRevenue, setPendingRevenue] = useState(0);
  const [averageInvoiceValue, setAverageInvoiceValue] = useState(0);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState({
    percentChange: 0,
    isPositive: true,
  });

  const [localCurrency, setLocalCurrency] = useState<CurrencyData>({
    code: "USD",
    flag: null,
  });

  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // Process invoice data into analytics
  const processAnalytics = (
    invoicesData: Invoice[],
    startDate: Date,
    endDate: Date
  ) => {
    // Filter paid invoices in the selected date range
    const paidInvoicesInRange = invoicesData.filter(
      (invoice) =>
        invoice.status === "paid" &&
        invoice.paidAt &&
        invoice.paidAt >= startDate &&
        invoice.paidAt <= endDate
    );

    // Calculate total revenue
    const revenue = paidInvoicesInRange.reduce(
      (sum, invoice) => sum + invoice.amount,
      0
    );
    setTotalRevenue(revenue);

    // Calculate number of paid invoices
    setPaidInvoices(paidInvoicesInRange.length);

    // Calculate pending revenue
    const pendingAmount = invoicesData
      .filter((invoice) => invoice.status === "pending")
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    setPendingRevenue(pendingAmount);

    // Calculate average invoice value
    setAverageInvoiceValue(
      paidInvoicesInRange.length > 0 ? revenue / paidInvoicesInRange.length : 0
    );

    // Calculate invoice status distribution
    const statusCounts = {
      paid: invoicesData.filter((invoice) => invoice.status === "paid").length,
      pending: invoicesData.filter(
        (invoice) =>
          invoice.status === "pending" &&
          new Date(invoice.dueDate) >= new Date()
      ).length,
      overdue: invoicesData.filter(
        (invoice) =>
          invoice.status === "pending" && new Date(invoice.dueDate) < new Date()
      ).length,
    };

    const statusDistData = [
      { name: "Paid", value: statusCounts.paid },
      { name: "Pending", value: statusCounts.pending },
      { name: "Overdue", value: statusCounts.overdue },
    ];
    setStatusDistribution(statusDistData);

    // Find top customers
    const customerMap = new Map<string, number>();
    paidInvoicesInRange.forEach((invoice) => {
      const currentTotal = customerMap.get(invoice.customerName) || 0;
      customerMap.set(invoice.customerName, currentTotal + invoice.amount);
    });

    const topCustomersData = Array.from(customerMap.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    setTopCustomers(topCustomersData);

    // Calculate period comparison (e.g., compared to previous 30 days)
    if (dateRange === "last30days") {
      const previousPeriodStart = subDays(startDate, 30);
      const previousPeriodEnd = subDays(endDate, 30);

      const previousPeriodInvoices = invoicesData.filter(
        (invoice) =>
          invoice.status === "paid" &&
          invoice.paidAt &&
          invoice.paidAt >= previousPeriodStart &&
          invoice.paidAt <= previousPeriodEnd
      );

      const previousRevenue = previousPeriodInvoices.reduce(
        (sum, invoice) => sum + invoice.amount,
        0
      );

      if (previousRevenue > 0) {
        const change = ((revenue - previousRevenue) / previousRevenue) * 100;
        setComparisonData({
          percentChange: Math.abs(Math.round(change)),
          isPositive: change >= 0,
        });
      } else if (revenue > 0) {
        setComparisonData({
          percentChange: 100,
          isPositive: true,
        });
      } else {
        setComparisonData({
          percentChange: 0,
          isPositive: true,
        });
      }
    }
  };

  // Fetch invoice data
  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      setError("");

      try {
        // Check for authenticated user first
        const user = auth.currentUser;
        if (!user) {
          router.push("/login");
          return;
        }

        // Determine date range based on filter
        let startDate = new Date();
        let endDate = new Date();

        if (dateRange === "last7days") {
          startDate = subDays(new Date(), 7);
        } else if (dateRange === "last30days") {
          startDate = subDays(new Date(), 30);
        } else if (dateRange === "thisMonth") {
          startDate = startOfMonth(new Date());
          endDate = endOfMonth(new Date());
        } else if (dateRange === "custom" && customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
        }

        // Get invoices ONLY for this merchant
        const invoicesRef = collection(db, "invoices");
        const q = query(invoicesRef, where("merchantId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const invoicesData: Invoice[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const dueDate = new Date(data.dueDate);
          const paidAt = data.paidAt ? new Date(data.paidAt) : undefined;

          // Convert to Invoice object
          const invoice: Invoice = {
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
          };

          // Filter by date range if needed for paid invoices
          if (invoice.status === "paid" && invoice.paidAt) {
            if (invoice.paidAt >= startDate && invoice.paidAt <= endDate) {
              invoicesData.push(invoice);
            }
          } else {
            // For pending/overdue invoices, just include them all
            invoicesData.push(invoice);
          }
        });

        setInvoices(invoicesData);

        // Calculate derived statistics
        processAnalytics(invoicesData, startDate, endDate);
      } catch (err) {
        console.error("Error fetching invoice data:", err);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [dateRange, customStartDate, customEndDate]);

  // load the currency data from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedCountry = sessionStorage.getItem("country");
        const storedFlag = sessionStorage.getItem("countryFlag");

        let currencyCode = "USD"; // Default

        // First try to get currency from country name
        if (storedCountry) {
          const mappedCurrency = (
            countryCurrencyMapping as Record<string, string>
          )[storedCountry];
          if (mappedCurrency) {
            currencyCode = mappedCurrency;
          }
        }

        if (storedFlag) {
          setLocalCurrency({
            code: currencyCode,
            flag: JSON.parse(storedFlag),
          });

          setSelectedCurrency(currencyCode);

          // Store the currency code in session storage for later use
          sessionStorage.setItem("countryCurrencyCode", currencyCode);
        }
      } catch (error) {
        console.error("Error loading currency data:", error);
      }
    }
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading analytics data...</p>
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold text-gray-900 mb-3 sm:mb-0">
          Business Analytics
        </h1>

        <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row sm:items-center">
          {/* Currency selector */}
          <div className="flex flex-row w-full sm:w-auto bg-white border border-gray-200 rounded shadow p-0.5">
            <button
              onClick={() => setSelectedCurrency("USDC")}
              className={`flex flex-1 items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors hover:cursor-pointer ${
                selectedCurrency === "USDC"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              aria-current={selectedCurrency === "USDC"}
            >
              <Image
                src="https://www.cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040"
                width={20}
                height={20}
                alt="USDC Logo"
              />
              <span className="ml-2">USDC</span>
            </button>

            {localCurrency.code !== "USD" && (
              <button
                onClick={() => setSelectedCurrency("USD")}
                className={`flex flex-1 items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors hover:cursor-pointer ${
                  selectedCurrency === "USD"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                aria-current={selectedCurrency === "USD"}
              >
                <span className="mr-2">$</span>
                <span>USD</span>
              </button>
            )}

            <button
              onClick={() => setSelectedCurrency(localCurrency.code)}
              className={`flex flex-1 items-center justify-center px-3 py-2 text-sm font-medium rounded-md ml-0.5 transition-colors hover:cursor-pointer ${
                selectedCurrency === localCurrency.code
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              aria-current={selectedCurrency === localCurrency.code}
              disabled={selectedCurrency === localCurrency.code}
            >
              {localCurrency.flag && (
                <span className="mr-2">{localCurrency.flag.emoji}</span>
              )}
              <span>{localCurrency.code}</span>
            </button>
          </div>

          {/* Date range filter */}
          <div className="w-full sm:w-auto sm:ms-2">
            <div className="relative w-full">
              <select
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 appearance-none pr-8"
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  setShowCustomDateRange(e.target.value === "custom");
                }}
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Custom date range inputs */}
          {showCustomDateRange && (
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>

              <span className="text-gray-500 hidden sm:block">to</span>

              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Revenue Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <div className="p-2 bg-purple-100 rounded-full">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-end space-x-1">
            <p className="text-2xl font-bold text-gray-900">
              {selectedCurrency === "USDC" ? (
                <>{totalRevenue.toFixed(3)} USDC</>
              ) : (
                <>
                  {convertFromUsdc(totalRevenue, selectedCurrency)?.toFixed(3)}{" "}
                  {selectedCurrency}{" "}
                </>
              )}{" "}
            </p>
            {comparisonData.percentChange > 0 && (
              <div
                className={`flex items-center text-xs ${
                  comparisonData.isPositive ? "text-green-600" : "text-red-600"
                } mb-1`}
              >
                {comparisonData.isPositive ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                <span>{comparisonData.percentChange}%</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">vs. previous period</p>
        </div>

        {/* Invoices Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Paid Invoices</h3>
            <div className="p-2 bg-indigo-100 rounded-full">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{paidInvoices}</p>
          <p className="text-xs text-gray-500 mt-1">
            Avg.
            {selectedCurrency === "USDC" ? (
              <>{averageInvoiceValue.toFixed(3)} USDC</>
            ) : (
              <>
                {convertFromUsdc(
                  averageInvoiceValue,
                  selectedCurrency
                )?.toFixed(3)}{" "}
                {selectedCurrency}{" "}
              </>
            )}{" "}
            per invoice
          </p>
        </div>

        {/* Pending Revenue Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">
              Pending Revenue
            </h3>
            <div className="p-2 bg-yellow-100 rounded-full">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {selectedCurrency === "USDC" ? (
              <>{pendingRevenue.toFixed(3)} USDC</>
            ) : (
              <>
                {convertFromUsdc(pendingRevenue, selectedCurrency)?.toFixed(3)}{" "}
                {selectedCurrency}{" "}
              </>
            )}{" "}
          </p>
          <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
        </div>

        {/* Conversion Rate Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">
              Invoice Status
            </h3>
            <div className="p-2 bg-green-100 rounded-full">
              <BadgePercent className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {statusDistribution[0]?.value > 0
              ? Math.round(
                  (statusDistribution[0]?.value /
                    (statusDistribution[0]?.value +
                      statusDistribution[1]?.value +
                      statusDistribution[2]?.value)) *
                    100
                ) + "%"
              : "0%"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Invoice payment rate</p>
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Top Customers
        </h3>
        {topCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue ({selectedCurrency})
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topCustomers.map((customer, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {selectedCurrency === "USDC" ? (
                        <>{customer.total.toFixed(3)}</>
                      ) : (
                        <>
                          {convertFromUsdc(
                            customer.total,
                            selectedCurrency
                          )?.toFixed(3)}
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {totalRevenue > 0
                        ? ((customer.total / totalRevenue) * 100).toFixed(1)
                        : 0}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 my-8">
            No customer data available for the selected period
          </p>
        )}
      </div>

      {/* Recent Activity Section - could add more detailed transaction log here */}
    </div>
  );
}
