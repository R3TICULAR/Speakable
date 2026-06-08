import Link from "next/link";

interface SeeAlsoProps {
  href: string;
  title: string;
  description?: string;
}

/**
 * Inline callout component for documentation pages.
 * Renders a highlighted "see also" box with an arrow icon,
 * suitable for placing mid-content to link to related resources.
 */
export function SeeAlso({ href, title, description }: SeeAlsoProps) {
  return (
    <Link
      href={href}
      className="group my-6 block rounded-r-lg border-l-4 border-blue-500 bg-blue-50 px-5 py-4 transition-colors hover:bg-blue-100/50"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <span className="text-sm font-bold text-blue-700 group-hover:text-blue-900 transition-colors">
            {title}
          </span>
          {description && (
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <span
          className="shrink-0 text-blue-300 group-hover:text-blue-500 transition-colors"
          aria-hidden="true"
        >
          →
        </span>
      </div>
    </Link>
  );
}
