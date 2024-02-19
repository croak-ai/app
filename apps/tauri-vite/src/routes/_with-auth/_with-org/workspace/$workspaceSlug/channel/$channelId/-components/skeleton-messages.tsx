import { Skeleton } from "@acme/ui/components/ui/skeleton";

const SkeletonMessage = ({ bShowAvatar = false, bShowPicture = false }) => {
  return (
    <div className="flex items-start gap-4 pt-4">
      {bShowAvatar ? (
        <Skeleton className="h-8 w-8 rounded-full" />
      ) : (
        <div className="h-8 w-8"></div>
      )}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        {bShowPicture && <Skeleton className="h-48 w-64 rounded-lg" />}
      </div>
    </div>
  );
};

const SkeletonMessages = ({ count = 5 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonMessage
          key={index}
          bShowAvatar={Math.random() < 0.6}
          bShowPicture={Math.random() < 0.1}
        />
      ))}
    </div>
  );
};

export default SkeletonMessages;
