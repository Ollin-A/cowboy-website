import {Link} from 'react-router';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({items}: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 font-body text-sm text-text/60 list-none p-0 m-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-text/30 select-none">
                  /
                </span>
              )}
              {isLast ? (
                <span aria-current="page" className="text-text">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-text/60 hover:text-primary transition-colors duration-fast no-underline hover:no-underline"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
