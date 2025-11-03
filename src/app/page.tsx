import { BannerRenderGrid } from '@/components/banner-render-grid';
import { Header } from '@/components/layout/header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <BannerRenderGrid />
      </main>
      <footer className="py-4 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Banner RenderGrid. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
