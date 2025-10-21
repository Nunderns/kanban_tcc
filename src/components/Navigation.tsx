"use client";

import Link from "next/link";
import { useState } from "react";
import { SettingsIcon, ChevronDown, ChevronRight } from "lucide-react";
import {
    GoCheckCircle,
    GoCheckCircleFill,
    GoHome,
    GoHomeFill,
} from "react-icons/go";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    activeIcon?: React.ComponentType<{ className?: string }>;
    subItems?: {
        label: string;
        href: string;
    }[];
}

const routes: NavItem[] = [
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
        subItems: [
            {
                label: "Geral",
                href: "/dashboard/settings/general"
            },
            {
                label: "Membros",
                href: "/dashboard/settings/members"
            }
        ]
    }
];

export const Navigation = () => {
    const pathname = usePathname();
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

    const toggleSubmenu = (label: string) => {
        setOpenSubmenu(openSubmenu === label ? null : label);
    };

    return (
        <div className="flex flex-col space-y-1">
            {routes.map((item) => {
                const isActive = pathname === item.href || 
                    (item.subItems && item.subItems.some((subItem: { href: string }) => pathname === subItem.href));
                const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;
                const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
                
                return (
                    <div key={item.href} className="space-y-1">
                        <div 
                            className={cn(
                                "flex items-center justify-between p-2.5 rounded-md font-medium transition cursor-pointer",
                                isActive 
                                    ? "bg-white dark:bg-gray-800 shadow-sm text-primary dark:text-white" 
                                    : "text-neutral-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                            onClick={() => hasSubItems ? toggleSubmenu(item.label) : null}
                        >
                            <Link 
                                href={!hasSubItems ? item.href : '#'} 
                                className={cn("flex items-center gap-2.5 flex-1")}
                            >
                                <Icon className={cn("size-5", isActive ? "text-primary dark:text-white" : "text-neutral-500 dark:text-gray-300")} />
                                <span className="dark:text-white">{item.label}</span>
                            </Link>
                            
                            {hasSubItems && (
                                <span className="text-neutral-400">
                                    {openSubmenu === item.label ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </span>
                            )}
                        </div>

                        {hasSubItems && openSubmenu === item.label && (
                            <div className="ml-6 space-y-1 mt-1">
                                {item.subItems?.map((subItem) => {
                                    const isSubItemActive = pathname === subItem.href;
                                    return (
                                        <Link 
                                            key={subItem.href} 
                                            href={subItem.href}
                                            className={cn(
                                                "flex items-center w-full px-3 py-2.5 text-sm rounded-lg transition-colors dark:text-white",
                                                isSubItemActive
                                                    ? "text-indigo-600 dark:text-white bg-indigo-50 dark:bg-gray-800 font-medium"
                                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            )}
                                        >
                                            {subItem.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
