import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <h2 className="text-4xl font-serif font-bold text-gold mb-4">404</h2>
      <h3 className="text-xl font-medium mb-4">Page Not Found</h3>
      <p className="text-muted-foreground mb-8">
        Could not find the requested resource.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-gold text-primary-foreground rounded-lg hover:bg-gold/90 transition-colors font-medium"
      >
        Return Home
      </Link>
    </div>
  );
}
