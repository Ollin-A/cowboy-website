import {Link} from 'react-router';
import type {Route} from './+types/$';
import Button from '~/components/ui/Button';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Page Not Found | Cowboy'},
    {name: 'robots', content: 'noindex, nofollow'},
  ];
};

export async function loader({request}: Route.LoaderArgs) {
  throw new Response(`${new URL(request.url).pathname} not found`, {
    status: 404,
  });
}

export default function CatchAllPage() {
  return null;
}

export function ErrorBoundary() {
  return (
    <div className="container-content flex flex-col items-center justify-center text-center py-24 md:py-36 min-h-[60vh]">
      <h1 className="font-heading text-hero tracking-tight text-primary mb-4">
        404
      </h1>
      <p className="font-heading text-h3 md:text-h2 tracking-tight text-primary mb-6">
        This page has ridden off into the sunset.
      </p>
      <p className="font-body text-base md:text-lg text-text/70 mb-10 max-w-md">
        The page you're looking for doesn't exist or may have been moved. Let's
        get you back on the trail.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/">
          <Button size="lg">Back to Home</Button>
        </Link>
        <Link to="/collections">
          <Button variant="secondary" size="lg">
            Browse Collections
          </Button>
        </Link>
      </div>
    </div>
  );
}
