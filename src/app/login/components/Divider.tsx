export default function Divider() {
  return (
    <div className="relative w-full max-w-xs my-4">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
          ou
        </span>
      </div>
    </div>
  );
}
