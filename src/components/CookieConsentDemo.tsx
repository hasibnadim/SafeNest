"use client";

import { useCookieConsent } from "@/hooks/useCookieConsent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, BarChart3, Megaphone } from "lucide-react";

export default function CookieConsentDemo() {
  const { preferences, hasConsent, clearConsent, getConsentDate } = useCookieConsent();

  const handleAnalytics = () => {
    if (hasConsent("analytics")) {
      console.log("Analytics tracking enabled - user consented");
      // Implement your analytics tracking here
    } else {
      console.log("Analytics tracking disabled - no consent");
    }
  };

  const handleMarketing = () => {
    if (hasConsent("marketing")) {
      console.log("Marketing cookies enabled - user consented");
      // Implement your marketing tracking here
    } else {
      console.log("Marketing cookies disabled - no consent");
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Shield className="w-5 h-5 text-blue-500" />
          Cookie Consent Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Necessary Cookies Status */}
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Necessary
              </span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Always active
            </p>
          </div>

          {/* Analytics Cookies Status */}
          <div className={`p-3 rounded-lg border ${
            hasConsent("analytics") 
              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" 
              : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className={`w-4 h-4 ${
                hasConsent("analytics") ? "text-blue-600" : "text-gray-400"
              }`} />
              <span className={`text-sm font-medium ${
                hasConsent("analytics") 
                  ? "text-blue-800 dark:text-blue-200" 
                  : "text-gray-600 dark:text-gray-400"
              }`}>
                Analytics
              </span>
            </div>
            <p className={`text-xs ${
              hasConsent("analytics") 
                ? "text-blue-600 dark:text-blue-400" 
                : "text-gray-500 dark:text-gray-500"
            }`}>
              {hasConsent("analytics") ? "Consent given" : "No consent"}
            </p>
          </div>

          {/* Marketing Cookies Status */}
          <div className={`p-3 rounded-lg border ${
            hasConsent("marketing") 
              ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" 
              : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className={`w-4 h-4 ${
                hasConsent("marketing") ? "text-purple-600" : "text-gray-400"
              }`} />
              <span className={`text-sm font-medium ${
                hasConsent("marketing") 
                  ? "text-purple-800 dark:text-purple-200" 
                  : "text-gray-600 dark:text-gray-400"
              }`}>
                Marketing
              </span>
            </div>
            <p className={`text-xs ${
              hasConsent("marketing") 
                ? "text-purple-600 dark:text-purple-400" 
                : "text-gray-500 dark:text-gray-500"
            }`}>
              {hasConsent("marketing") ? "Consent given" : "No consent"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            size="sm" 
            onClick={handleAnalytics}
            variant={hasConsent("analytics") ? "default" : "outline"}
            className={hasConsent("analytics") ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            <BarChart3 className="w-3 h-3 mr-1" />
            Test Analytics
          </Button>
          
          <Button 
            size="sm" 
            onClick={handleMarketing}
            variant={hasConsent("marketing") ? "default" : "outline"}
            className={hasConsent("marketing") ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            <Megaphone className="w-3 h-3 mr-1" />
            Test Marketing
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={clearConsent}
          >
            Clear Consent
          </Button>
        </div>

        {/* Consent Information */}
        {preferences && (
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p>Consent given: {getConsentDate()?.toLocaleDateString() || "Unknown"}</p>
            <p>Preferences: {JSON.stringify(preferences, null, 2)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 