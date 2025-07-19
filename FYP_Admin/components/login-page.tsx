"use client";

import type React from "react";
import { useState } from "react";
import { ShoppingCart, Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { GradientButton } from "./ui/gradient-button";
import { GradientCard } from "./ui/gradient-card";
import { login } from "@/services/authService";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await login({ email, password });
      console.log("Login successful", res);
      onLoginSuccess();
    } catch (err: any) {
      setError("Invalid email or password");
      console.error("Login failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#A855F7] flex items-center justify-center px-6">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md border border-white/20">
        {/* Left: Logo */}
        <div className="flex-1 flex items-center justify-center bg-white/20 p-10">
          <img
            src="/logo.png"
            alt="Fiesta Carts Logo"
            className="w-52 md:w-60"
          />
        </div>

        {/* Right: Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 sm:p-8">
          <GradientCard className="w-full max-w-md bg-white/95 backdrop-blur-sm border border-white/20 shadow-md">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <p className="text-gray-600 mt-2 text-sm">
                Sign in to your admin account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@fiestacarts.com"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Remember Me / Forgot Password */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#6366F1] border-gray-300 rounded focus:ring-[#6366F1] focus:ring-2"
                  />
                  <span className="ml-2">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-[#6366F1] hover:text-[#8B5CF6] transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Button */}
              <GradientButton
                className={`w-full py-3 mt-1 font-medium ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </GradientButton>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-100">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-bold text-purple-800">
                  Demo Credentials
                </h4>
              </div>
              <div className="text-sm text-purple-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Email:</span>
                  <code className="bg-white/60 px-2 py-1 rounded text-xs">
                    admin@fiestacarts.com
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Password:</span>
                  <code className="bg-white/60 px-2 py-1 rounded text-xs">
                    admin123
                  </code>
                </div>
              </div>
            </div>
          </GradientCard>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
