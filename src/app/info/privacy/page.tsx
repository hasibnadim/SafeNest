import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Eye, Lock, Database, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  const sections = [
    {
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us. This may include your name, email address, and any other information you choose to provide."
    },
    {
      title: "How We Use Your Information",
      content: "We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to develop new features. We may also use your information to ensure the security of our platform."
    },
    {
      title: "Information Sharing",
      content: "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with service providers who assist us in operating our platform."
    },
    {
      title: "Data Security",
      content: "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure."
    },
    {
      title: "Cookies and Tracking",
      content: "We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences."
    },
    {
      title: "Your Rights",
      content: "You have the right to access, update, or delete your personal information. You may also have the right to restrict or object to certain processing of your information."
    },
    {
      title: "Data Retention",
      content: "We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy, unless a longer retention period is required by law."
    },
    {
      title: "Changes to This Policy",
      content: "We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &apos;Last updated&apos; date."
    }
  ];

  const privacyFeatures = [
    {
      icon: Lock,
      title: "Data Encryption",
      description: "All data is encrypted in transit and at rest"
    },
    {
      icon: Eye,
      title: "Privacy Controls",
      description: "Granular control over your data and privacy settings"
    },
    {
      icon: Database,
      title: "Secure Storage",
      description: "Industry-standard security for data storage"
    },
    {
      icon: Users,
      title: "No Third-Party Sharing",
      description: "Your data stays with us unless you consent"
    }
  ];

  return (
    <div className="min-h-screen bg-white/80 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-sm ring-1 ring-slate-100/60 dark:ring-0">
            <Shield className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-medium text-slate-900 dark:text-gray-300">Privacy Policy</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-teal-800 to-amber-700 dark:from-white dark:via-teal-200 dark:to-amber-200 bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Privacy Features */}
  <Card className="mb-8 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Lock className="w-5 h-5 text-green-500" />
              Our Privacy Commitments
            </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {privacyFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-slate-700/50">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-gray-100 text-sm">{feature.title}</h3>
                    <p className="text-xs text-slate-700 dark:text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Privacy Sections */}
        <div className="space-y-6 mb-8">
          {sections.map((section, index) => (
            <Card key={index} className="border-0 shadow-sm bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                  {index + 1}. {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Information */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-5 h-5 text-blue-500" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Data Protection Officer</h4>
                  <p className="text-gray-600 dark:text-gray-400">Email: safenest0.bd@gmail.com</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">General Inquiries</h4>
                  <p className="text-gray-600 dark:text-gray-400">Email: safenest0.bd@gmail.com</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Related Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/info/about">
                <Button variant="outline" size="sm">
                  About Us
                </Button>
              </Link>
              <Link href="/info/terms">
                <Button variant="outline" size="sm">
                  Terms of Service
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