"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Globe, BookOpen, Code, Shield, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useSyncExternalStore } from "react";

const faqCategories = [
  {
    title: "Safe Nest",
    icon: Globe,
    slug: "safe-nest",
    questions: [
      {
        question: "What is Safe Nest?",
        answer: "Safe Nest is your trusted partner to find your best home for living.",
        slug: "what-is-safe-nest"
      },
      {
        question: "How do I get started?",
        answer: "To to property list find your required house",
        slug: "how-to-begin"
      },
      {
        question: "Is it free?",
        answer: "Yes. Signing in is free, and the public parts of the site stay open to everyone. An account simply means your own space is kept for you between visits.",
        slug: "is-it-free"
      }
    ]
  },
  {
    title: "Your Account",
    icon: BookOpen,
    slug: "your-account",
    questions: [
      {
        question: "Do I need an account?",
        answer: "To find properties and view their details, you do not need an account. However, to unlock sensitive information like contact details and address, you will need to create an account and sign in.",
        slug: "need-account"
      }
    ]
  }
];
function findItemForSlug(slug: string): string {
  let targetItem = '';
  faqCategories.forEach((category, categoryIndex) => {
    category.questions.forEach((question, questionIndex) => {
      if (question.slug === slug) {
        targetItem = `item-${categoryIndex}-${questionIndex}`;
      }
    });
  });
  return targetItem;
}

// The URL hash lives outside React, so read it as a store rather than copying it
// into state from an effect.
function subscribeToHash(onStoreChange: () => void) {
  window.addEventListener('hashchange', onStoreChange);
  return () => window.removeEventListener('hashchange', onStoreChange);
}

const readHash = () => window.location.hash.replace('#', '');
const readServerHash = () => '';

export default function FAQPage() {
  const hash = useSyncExternalStore(subscribeToHash, readHash, readServerHash);
  const [selection, setSelection] = useState<string | undefined>(undefined);

  // Until the visitor picks an item, follow the hash from the URL.
  const openItem = selection ?? (hash ? findItemForSlug(hash) : undefined);

  // Bring the linked question into view. Scrolling is an external system, so
  // doing it from an effect is correct.
  useEffect(() => {
    if (!openItem) return;
    const timer = setTimeout(() => {
      document.getElementById(openItem)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    return () => clearTimeout(timer);
  }, [openItem]);

  // Update URL when accordion item opens
  const handleAccordionChange = (value: string | undefined) => {
    setSelection(value);

    if (value && typeof window !== 'undefined') {
      // Find the slug for the opened item
      let targetSlug = '';
      faqCategories.forEach((category, categoryIndex) => {
        category.questions.forEach((question, questionIndex) => {
          if (`item-${categoryIndex}-${questionIndex}` === value) {
            targetSlug = question.slug;
          }
        });
      });

      if (targetSlug) {
        // Update URL without page reload
        const newUrl = `${window.location.pathname}#${targetSlug}`;
        window.history.pushState({}, '', newUrl);
      }
    } else if (!value && typeof window !== 'undefined') {
      // Remove hash when accordion closes
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  return (
    <div className="min-h-screen bg-white/80 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-sm ring-1 ring-slate-100/60 dark:ring-0">
            <HelpCircle className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-medium text-slate-900 dark:text-gray-300">Frequently Asked Questions</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-teal-800 to-amber-700 dark:from-white dark:via-teal-200 dark:to-amber-200 bg-clip-text text-transparent mb-4">
            FAQ
          </h1>
          <p className="text-lg text-slate-700 dark:text-gray-400 max-w-2xl mx-auto">
            Straight answers about Safe Nest — your account, how your data is handled, and how the whole thing is put together.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-amber-500 rounded-lg flex items-center justify-center">
                    <category.icon className="w-4 h-4 text-white" />
                  </div>
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  value={openItem}
                  onValueChange={handleAccordionChange}
                >
                  {category.questions.map((item, itemIndex) => {
                    const itemId = `item-${categoryIndex}-${itemIndex}`;
                    return (
                      <AccordionItem key={itemIndex} value={itemId} id={itemId}>
                        <AccordionTrigger className="text-left hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {item.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          <p>{item.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="mt-12 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Still Have Questions?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Can&apos;t find what you&apos;re looking for? We&apos;re here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/info/about">
                <Button variant="outline" size="sm">
                  About Us
                </Button>
              </Link>
              <Link href="https://github.com/hasibnadim/web-tools" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  GitHub Issues
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
