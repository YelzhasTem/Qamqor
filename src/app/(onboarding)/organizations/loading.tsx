import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationsLoading() {
  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pt-8 pb-32">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="mt-3 h-5 w-full" />
      <Skeleton className="mt-6 h-12 w-full rounded-control" />
      <div className="mt-4 flex gap-2"><Skeleton className="h-11 w-16 rounded-full" /><Skeleton className="h-11 w-28 rounded-full" /><Skeleton className="h-11 w-24 rounded-full" /></div>
      <div className="mt-5 grid gap-3">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-[76px] w-full" />)}</div>
    </div>
  );
}
