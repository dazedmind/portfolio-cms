export default function TabLoadingSkeleton() {
  return (
    <div className="h-screen overflow-hidden p-8 lg:p-10 pb-12 animate-pulse">
      <div className="flex items-center justify-between pb-6">
        <div>
          <div className="h-8 bg-neutral-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-neutral-700 rounded w-32"></div>
        </div>
        <div className="h-10 bg-neutral-700 rounded w-32"></div>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-neutral-800 rounded-lg p-6">
            <div className="h-6 bg-neutral-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-neutral-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-neutral-700 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

