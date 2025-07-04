import Link from "next/link";
import { SettingsIcon, UsersIcon } from "lucide-react";
import {
    GoCheckCircle,
    GoCheckCircleFill,
    GoHome,
    GoHomeFill,
} from "react-icons/go";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const routes = [
    {
        label: "Inicio",
        href: "/dashboard",
        icon: GoHome,
        activeIcon: GoHomeFill,
    },
    {
        label: "Minhas Tarefas",
        href: "/dashboard/my-tasks",
        icon: GoCheckCircle,
        activeIcon: GoCheckCircleFill,
    },
    {
        label: "Configurações",
        href: "/dashboard/settings/general",
        icon: SettingsIcon,
        activeIcon: SettingsIcon,
    },
    {
        label: "Membros",
        href: "/dashboard/settings/members",
        icon: UsersIcon,
        activeIcon: UsersIcon,
    }
];

export const Navigation = () => {
    const pathname = usePathname();

    return (
        <div className="flex flex-col">
            {routes.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = isActive ? item.activeIcon : item.icon;
                
                return (
                    <Link key={item.href} href={item.href}>
                        <div className={cn(
                            "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500",
                            isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
                        )}>
                            <Icon className="size-5 text-neutral-500" />
                            {item.label}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};
