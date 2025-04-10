"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function TopProgressBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 700);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div
        className={`h-full bg-blue-500 transition-all duration-500 ease-in-out ${
          loading ? "w-full" : "w-0"
        }`}
      />
    </div>
  );
}
