/**
 * Testimonial card — social proof for the home page.
 * In a real app this data would come from a DB or CMS.
 */

import { Quote, ShieldCheck, Star } from "lucide-react";

/**
 * Utility function to merge class names conditionally.
 * Joins classes, filtering out falsy values.
 */
function cn(classes: string | string[] | undefined, ...additional: (string | undefined)[]): string {
  const allClasses = [classes, ...additional]
    .filter((c): c is string => typeof c === "string")
    .join(" ");
  return allClasses ? allClasses.trim() : "";
}

/**
 * Testimonial — displays social proof cards.
 * In a real app this data would come from a DB or CMS.
 */
type Testimonial = {
  name: string;
  role: string;
  text: string;
  rating: number; // 1-5
};

const testimonials: Testimonial[] = [
  {
    name: "Rahima Aktar",
    role: "Student, Dhaka",
    text:
      "Safe Nest made signing in hassle-free. I no longer worry about my session being stolen — it's http-only and server-verified.",
    rating: 5,
  },
  {
    name: "Mosharraf Hossain",
    role: "Small business owner",
    text:
      "The property listings are clean, verified, and easy to filter. My tenants find me through Safe Nest instantly.",
    rating: 4,
  },
  {
    name: "Tahamina Begum",
    role: "Freelancer",
    text:
      "Privacy used to be an afterthought. Now I know my data stays mine. That peace of mind is priceless.",
    rating: 5,
  },
];

export function Testimonial({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white dark:border-white/5 dark:bg-[#060d16]",
        className,
      )}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900 transition-all duration-300 hover:border-teal-500/30 hover:shadow-lg hover:shadow-slate-200/40"
            >
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-amber-500 mt-1" />
                <blockquote className="flex-1 font-serif italic text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 dark:text-slate-100">{t.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{t.role}</span>
                </div>

                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }, (_, idx) => (
                    <Star
                      key={idx}
                      className="h-3.5 w-3.5 text-amber-500"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}