import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import DottedSeparator from "@/components/DottedSeparator";

export const Sidebar = () => {
    return (
        <aside className="h-full bg-neutral-100 p-4 w-full">
            <Link href="/dashboard" className="text-lg font-semibold">
                TaskPulse
            </Link>
            <DottedSeparator className="my-4" />
            <Navigation />
        </aside>       
    );
};

export default Sidebar;
