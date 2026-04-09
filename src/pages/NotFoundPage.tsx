import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

export default function NotFoundPage() {
  useSEO({
    title: 'Page Not Found | OnRamp',
    description: 'The page you are looking for does not exist.',
    noindex: true,
  });

  return (
    <div className="min-h-screen bg-carbon-950 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-carbon-200 mb-8">
          Page not found
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-electric-500 hover:bg-electric-600 text-white font-medium rounded-lg transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
