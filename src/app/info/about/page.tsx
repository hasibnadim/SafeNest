import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Heart, Lock, ShieldCheck, Users, Wallet, Zap } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Verified Sign-In",
      description: "Google OAuth, verified server-side before a session is issued"
    },
    {
      icon: Lock,
      title: "Sealed Sessions",
      description: "http-only cookies that scripts cannot read or forge"
    },
    {
      icon: Users,
      title: "One Account",
      description: "Profile, wallet, and settings gathered in one place"
    },
    {
      icon: Wallet,
      title: "Your Wallet",
      description: "A personal space tied to your account and nowhere else"
    },
    {
      icon: Bell,
      title: "Private By Default",
      description: "Optional analytics stay off until you turn them on"
    },
    {
      icon: Zap,
      title: "Fast & Lightweight",
      description: "An installable app that keeps working offline"
    }
  ];

  const stats = [
    { label: "The Nest Is Always Open", value: "24/7" },
    { label: "Active Users", value: "1000+" },
    { label: "Countries", value: "50+" }
  ];

  return (
    <div className="min-h-screen bg-white/80 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-sm ring-1 ring-slate-100/60 dark:ring-0">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-medium text-slate-900 dark:text-gray-300">About Safe Nest</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-teal-800 to-amber-700 dark:from-white dark:via-teal-200 dark:to-amber-200 bg-clip-text text-transparent mb-4">
            Safe Nest
          </h1>
          <p className="text-lg text-slate-700 dark:text-gray-400 max-w-2xl mx-auto">
            A protected place online — calm by design, secure by default, and built so your attention stays on your life instead of on us.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Heart className="w-5 h-5 text-red-500" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We build safety that stays out of your way. Safe Nest exists so the parts of your digital life that matter — your account, your wallet,
              your settings — sit somewhere defended without ever asking for your attention. We verify every sign-in on the server, keep sessions
              sealed inside http-only cookies, and never sell your data. The nest is meant to be quiet: you get on with your day, and it holds.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-amber-500 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-gray-100">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team/Contact */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Have questions, suggestions, or want to contribute? We&apos;d love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/info/faq">
                <Button variant="outline" size="sm">
                  FAQ
                </Button>
              </Link>
              <Link href="/info/terms">
                <Button variant="outline" size="sm">
                  Terms of Service
                </Button>
              </Link>
              <Link href="/info/privacy">
                <Button variant="outline" size="sm">
                  Privacy Policy
                </Button>
              </Link>
              <Link href="/">
                <Button size="sm" className="bg-gradient-to-r from-teal-600 to-amber-600 hover:from-teal-700 hover:to-amber-700">
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