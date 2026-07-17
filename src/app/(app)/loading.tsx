import { Skeleton } from "@/components/ui/skeleton";
export default function AppLoading() { return <div><Skeleton className="h-10 w-64" /><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map((item) => <Skeleton key={item} className="h-32" />)}</div><div className="mt-7 grid gap-6 lg:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div></div>; }
