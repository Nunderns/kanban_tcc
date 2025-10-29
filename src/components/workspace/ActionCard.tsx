'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type ActionCardProps = {
  title: string;
  description: string;
  buttonText: string;
  href: string;
};

export function ActionCard({ title, description, buttonText, href }: ActionCardProps) {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm flex flex-col justify-between">
      <div>
        <h2 className="text-gray-800 dark:text-gray-200 font-medium mb-1">{title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {description}
        </p>
      </div>
      <Button 
        onClick={() => router.push(href)}
        className="w-full sm:w-auto"
      >
        {buttonText}
      </Button>
    </div>
  );
}