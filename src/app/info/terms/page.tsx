import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Shield, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  const sections = [
    {
      title: "Acceptance of Terms",
      content: "By accessing and using Safe Nest, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
    },
    {
      title: "Use License",
      content: "Permission is granted to temporarily download one copy of the materials (information or software) on Safe Nest for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title."
    },
    {
      title: "Disclaimer",
      content: "The materials on Safe Nest are provided on an &apos;as is&apos; basis. Safe Nest makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights."
    },
    {
      title: "Limitations",
      content: "In no event shall Safe Nest or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Safe Nest."
    },
    {
      title: "Accuracy of Materials",
      content: "The materials appearing on Safe Nest could include technical, typographical, or photographic errors. Safe Nest does not warrant that any of the materials on its website are accurate, complete or current."
    },
    {
      title: "Links",
      content: "Safe Nest has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Safe Nest of the site."
    },
    {
      title: "Modifications",
      content: "Safe Nest may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these Terms and Conditions of Use."
    },
    {
      title: "Governing Law",
      content: "These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location."
    }
  ];

  const keyPoints = [
    "Acceptance of terms is required for service use",
    "Personal, non-commercial use only",
    "No warranties provided",
    "Limited liability for damages",
    "Materials may contain errors",
    "External links not endorsed",
    "Terms subject to modification",
    "Local law governs disputes"
  ];

  return (
    <div className="min-h-screen bg-white/80 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-sm ring-1 ring-slate-100/60 dark:ring-0">
            <FileText className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-medium text-slate-900 dark:text-gray-300">Terms of Service</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-teal-800 to-amber-700 dark:from-white dark:via-teal-200 dark:to-amber-200 bg-clip-text text-transparent mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Key Points */}
  <Card className="mb-8 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Important Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {keyPoints.map((point, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-6 mb-8">
          {sections.map((section, index) => (
            <Card key={index} className="border-0 shadow-sm bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 dark:text-gray-100">
                  {index + 1}. {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 dark:text-gray-300 leading-relaxed">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact & Navigation */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="w-5 h-5 text-teal-500" />
              Questions About Terms?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions about these Terms of Service, please contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/info/about">
                <Button variant="outline" size="sm">
                  About Us
                </Button>
              </Link>
              <Link href="/info/privacy">
                <Button variant="outline" size="sm">
                  Privacy Policy
                </Button>
              </Link>
              <Link href="/">
                <Button size="sm" className="bg-gradient-to-r from-teal-600 to-amber-600 hover:from-teal-700 hover:to-amber-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 