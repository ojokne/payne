"use client";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Info,
  Eye,
  EyeOff,
  AlertCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState({
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: "", // "success" or "error"
    message: "",
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {
      businessName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreedToTerms: "",
    };

    let isValid = true;

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms =
        "You must agree to the Terms of Service and Privacy Policy";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const normalizedEmail = formData.email.trim().toLowerCase();

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        formData.password
      );

      // Save user data to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        businessName: formData.businessName,
        email: formData.email,
        createdAt: new Date().toISOString(),
        role: "merchant",
      });

      // Update the user's profile with the business name
      await updateProfile(userCredential.user, {
        displayName: formData.businessName,
      });

      // Show success notification
      setNotification({
        show: true,
        type: "success",
        message: "Account created successfully! Redirecting...",
      });

      router.push("/dashboard");
    } catch (error: any) {
      setLoading(false);
      console.error("Signup error:", error);

      // Handle different error codes
      let errorMessage = "An unexpected error occurred. Please try again.";

      switch (error.code) {
        case "auth/email-already-in-use":
          try {
            // Try to sign in with the provided credentials
            await signInWithEmailAndPassword(
              auth,
              normalizedEmail,
              formData.password
            );

            // Show success message if sign-in works
            setNotification({
              show: true,
              type: "success",
              message: "You already have an account. Signing you in...",
            });

            // Redirect
            setTimeout(() => {
              router.push("/dashboard");
            }, 1500);
            return;
          } catch (signInError) {
            // If sign-in fails, tell user to login manually
            errorMessage =
              "Account already exists. Please login with the correct password.";
          }
          break;

        case "auth/weak-password":
          errorMessage =
            "Password is too weak. Please use at least 6 characters.";
          break;

        case "auth/invalid-email":
          errorMessage = "Invalid email address format.";
          break;

        case "auth/network-request-failed":
          errorMessage =
            "Network error. Please check your connection and try again.";
          break;

        case "auth/too-many-requests":
          errorMessage =
            "Too many unsuccessful sign-up attempts. Please try again later or reset your password.";
          break;
      }

      setNotification({
        show: true,
        type: "error",
        message: errorMessage,
      });
    }
  };

  const Notification = ({
    type,
    message,
    onClose,
  }: {
    type: string;
    message: string;
    onClose: () => void;
  }) => {
    return (
      <div
        className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md animate-slide-in-right ${
          type === "success"
            ? "bg-green-50 border-l-4 border-green-500 text-green-700"
            : "bg-red-50 border-l-4 border-red-500 text-red-700"
        }`}
      >
        {type === "success" ? (
          <Check size={20} className="text-green-500 flex-shrink-0" />
        ) : (
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
        )}
        <p>{message}</p>
        <button
          onClick={onClose}
          className="ml-auto text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
              Payne
            </h1>
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900">
            Create your account
          </h2>
          <p className="text-gray-600 mt-2">
            Start accepting payments with USDC today
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          {/* Notification Banner */}
          {notification.show && (
            <div className="mb-6">
              <Notification
                type={notification.type}
                message={notification.message}
                onClose={() =>
                  setNotification({ ...notification, show: false })
                }
              />
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Business Name */}
            <div className="mb-5">
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Business Name
              </label>
              <div className="mb-1 flex gap-1 items-center text-sm text-gray-500">
                <Info size={14} />
                <span>
                  This name will appear on customer invoices and receipts
                </span>
              </div>
              <input
                id="businessName"
                name="businessName"
                type="text"
                value={formData.businessName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.businessName ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition`}
                placeholder="Your Business Name"
              />
              {errors.businessName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.businessName}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.email ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition`}
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    errors.confirmPassword
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition`}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Show password checkbox */}
            <div className="mb-6">
              <div className="flex items-center">
                <input
                  id="showPassword"
                  name="showPassword"
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label
                  htmlFor="showPassword"
                  className="ml-2 block text-sm text-gray-600"
                >
                  Show password
                </label>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreedToTerms"
                    name="agreedToTerms"
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreedToTerms" className="text-gray-600">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-purple-600 hover:text-purple-800"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-purple-600 hover:text-purple-800"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
              {errors.agreedToTerms && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.agreedToTerms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-lg font-medium flex items-center justify-center transition shadow-md hover:shadow-lg ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
