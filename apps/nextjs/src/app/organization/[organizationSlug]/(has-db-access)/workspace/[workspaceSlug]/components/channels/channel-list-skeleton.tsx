import { Skeleton } from "@acme/ui/components/ui/skeleton";
export const ChannelSkeleton = () => {
  return (
    <div>
      <Skeleton className="mb-6 h-6 w-24" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="mb-4 flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
};

export default ChannelSkeleton;
