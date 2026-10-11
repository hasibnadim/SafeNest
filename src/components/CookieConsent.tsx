"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, X, Settings, CheckCircle } from "lucide-react";
import { useCookieConsent, type CookiePreferences } from "@/hooks/useCookieConsent";

export default function CookieConsent() {
  const [dismissed, setDismissed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { preferences, isLoaded, updatePreferences } = useCookieConsent();
  const [localPreferences, setLocalPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  // Derived rather than stored: the banner shows once loading has finished and
  // the visitor has not saved a choice yet.
  const showConsent = isLoaded && !preferences && !dismissed;

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(allAccepted);
  };

  const acceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    saveConsent(necessaryOnly);
  };

  const saveCustomPreferences = () => {
    saveConsent(localPreferences);
  };

  const saveConsent = (cookiePrefs: CookiePreferences) => {
    updatePreferences(cookiePrefs);
    setDismissed(true);
    setShowSettings(false);
    
    // Trigger any necessary cookie management
    manageCookies(cookiePrefs);
  };

  const manageCookies = (prefs: CookiePreferences) => {
    // Here you would implement actual cookie management
    // For now, we'll just log the preferences
    console.log("Cookie preferences saved:", prefs);
    
    // Example: Enable/disable analytics based on preference
    if (prefs.analytics) {
      // Enable analytics cookies
      console.log("Analytics cookies enabled");
    } else {
      // Disable analytics cookies
      console.log("Analytics cookies disabled");
    }
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto">
        {!showSettings ? (
          // Main consent banner
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Cookie Preferences
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
                  You can choose which cookies to accept.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    size="sm" 
                    onClick={acceptAll}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Accept All
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={acceptNecessary}
                  >
                    Necessary Only
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Customize
                  </Button>
                </div>
              </div>
              
              <button
                onClick={() => setDismissed(true)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          // Settings panel
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Cookie Settings
                </h3>
                
                <div className="space-y-3 mb-4">
                  {/* Necessary Cookies */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Necessary Cookies
                        </h4>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          Always Active
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Essential for the website to function properly
                      </p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Analytics Cookies
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Help us understand how visitors interact with our website
                      </p>
                    </div>
                                         <label className="relative inline-flex items-center cursor-pointer">
                       <input
                         type="checkbox"
                         aria-label="Analytics cookies"
                         checked={localPreferences.analytics}
                         onChange={(e) => setLocalPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                         className="sr-only peer"
                       />
                       <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                     </label>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Marketing Cookies
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Used to deliver personalized advertisements
                      </p>
                    </div>
                                         <label className="relative inline-flex items-center cursor-pointer">
                       <input
                         type="checkbox"
                         aria-label="Marketing cookies"
                         checked={localPreferences.marketing}
                         onChange={(e) => setLocalPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                         className="sr-only peer"
                       />
                       <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                     </label>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    size="sm" 
                    onClick={saveCustomPreferences}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                  >
                    Save Preferences
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowSettings(false)}
                  >
                    Back
                  </Button>
                </div>
              </div>
              
              <button
                onClick={() => setDismissed(true)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 