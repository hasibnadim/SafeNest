'use client'

import React from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const rechargeOptions = [20, 50, 100, 250]

const recentActivity = [
  { title: 'Property access unlocked', amount: '+15 SN', time: 'Today, 11:24 AM', type: 'credit' },
  { title: 'Listing contact fee', amount: '-8 SN', time: 'Yesterday, 6:40 PM', type: 'debit' },
  { title: 'Referral bonus', amount: '+25 SN', time: 'Mon, 9:15 AM', type: 'credit' },
]

const WalletPage = () => {
  const [showRecharge, setShowRecharge] = React.useState(false)
  const [selectedAmount, setSelectedAmount] = React.useState(50)
  const [balance, setBalance] = React.useState(128.5)

  const handleTopUp = () => {
    setBalance((current) => Number((current + selectedAmount).toFixed(2)))
    setShowRecharge(false)
  }

  return (
    <div className="min-h-screen bg-slate-100/80 px-3 py-4 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-4xl space-y-3">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              SafeNest wallet
            </p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.04em]">Wallet</h1>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure balance
          </div>
        </header>

        <div className="grid gap-3 lg:grid-cols-[1.55fr_0.9fr]">
          <Card className="overflow-hidden border-slate-200 bg-slate-900 text-white shadow-sm dark:border-slate-800 dark:shadow-none">
            <CardHeader className="flex flex-row items-start justify-between gap-4 px-4 pb-0 pt-4">
              <div>
                <CardDescription className="text-[11px] text-slate-300">Current balance</CardDescription>
                <CardTitle className="mt-2 text-[32px] font-semibold tracking-[-0.05em] text-white">
                  {balance.toFixed(1)} <span className="text-base text-slate-300">SN</span>
                </CardTitle>
              </div>

              <div className="rounded-full border border-white/15 bg-white/5 p-1.5 text-slate-100">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            </CardHeader>

            <CardContent className="space-y-3 px-4 pb-4">
              <p className="max-w-md text-[12px] leading-5 text-slate-300">
                SafeNest credit is used to unlock property contacts, locations, and premium listing details.
              </p>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="h-8 rounded-md bg-white px-3 text-[12px] font-medium text-slate-900 hover:bg-slate-100"
                  onClick={() => setShowRecharge((value) => !value)}
                >
                  {showRecharge ? 'Close' : 'Add funds'}
                </Button>
                <Button variant="outline" size="sm" className="h-8 rounded-md border-white/15 bg-white/5 px-3 text-[12px] text-white hover:bg-white/10">
                  Transfer
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="pb-1.5">
              <CardTitle className="text-sm font-semibold">Quick insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Monthly spend</span>
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <p className="mt-1 text-xl font-semibold">42.5 <span className="text-[12px] font-medium text-slate-500">SN</span></p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Unlocked this month</span>
                  <CreditCard className="h-3.5 w-3.5 text-violet-500" />
                </div>
                <p className="mt-1 text-xl font-semibold">9</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {showRecharge && (
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="pb-1.5">
              <CardTitle className="text-base">Recharge wallet</CardTitle>
              <CardDescription className="text-[11px]">Add SafeNest credits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-3 pb-3">
              <div className="grid gap-2 sm:grid-cols-4">
                {rechargeOptions.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setSelectedAmount(amount)}
                    className={`rounded-xl border px-2.5 py-2 text-left transition-colors ${
                      selectedAmount === amount
                        ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                        : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Top up</div>
                    <div className="mt-1 text-base font-semibold">{amount} SN</div>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-950/70 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Selected amount</p>
                  <p className="text-lg font-semibold">{selectedAmount} SN</p>
                </div>
                <Button size="sm" className="h-8 text-[12px]" onClick={handleTopUp}>Confirm</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-1.5">
            <div>
              <CardTitle className="text-base">Recent activity</CardTitle>
              <CardDescription className="text-[11px]">Latest wallet transactions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-slate-600 dark:text-slate-300">
              View all
            </Button>
          </CardHeader>

          <CardContent className="space-y-2 pb-3">
            {recentActivity.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-950/70"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${
                      item.type === 'credit' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {item.type === 'credit' ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                  </div>

                  <div>
                    <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.time}</p>
                  </div>
                </div>

                <span
                  className={`text-[12px] font-semibold ${
                    item.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {item.amount}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default WalletPage
