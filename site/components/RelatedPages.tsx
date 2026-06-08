import Link from "next/link";

interface RelatedPage {
  href: string;
  title: string;
  description: string;
}

interface RelatedPagesProps {
  pages: RelatedPage[];
}

export function RelatedPages({ pages }: RelatedPagesProps) {
  return (
    <section className="mt-16 pt-12 border-t border-slate-200">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">
        Related Pages
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="group block p-5 border border-slate-200 rounded-xl transition-colors hover:border-blue-300 hover:bg-slate-50"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {page.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500 leading-relaxed line-clamp-2">
                  {page.description}
                </p>
              </div>
              <span
                className="shrink-0 text-slate-300 group-hover:text-blue-400 transition-colors material-symbols-outlined text-[20px]"
                aria-hidden="true"
              >
                arrow_forward
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
