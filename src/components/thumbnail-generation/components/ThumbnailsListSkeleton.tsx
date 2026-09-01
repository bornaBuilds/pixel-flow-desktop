export const ThumbnailsListSkeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 16 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse bg-zinc-800 aspect-video w-[200px]"
        />
      ))}
    </div>
  );
};
