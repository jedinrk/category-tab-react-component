import WhereToComponent from '@/components/WhereToComponent';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto">
        <div className="py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">WHERE TO Component Demo</h1>
          <p className="text-gray-600 mb-8">Pixel-perfect implementation based on 53 West 53 neighborhood page</p>
        </div>
        <WhereToComponent />
      </div>
    </main>
  );
}
