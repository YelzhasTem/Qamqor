import { Skeleton } from "@/components/ui/skeleton";
export default function ProjectsLoading() { return <div className="page-shell py-16"><Skeleton className="h-12 w-2/3" /><Skeleton className="mt-8 h-20 w-full" /><div className="mt-8 grid gap-6 md:grid-cols-3">{[1,2,3,4,5,6].map((item) => <Skeleton key={item} className="h-96" />)}</div></div>; }
