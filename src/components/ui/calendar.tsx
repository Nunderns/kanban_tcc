import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md",
          "text-gray-700 hover:bg-gray-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [\n&:has([aria-selected])]:bg-blue-50\n]",
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md",
          "hover:bg-gray-100 focus-visible:outline-none"
        ),
        day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white",
        day_today: "bg-gray-100 text-gray-900",
        day_outside: "text-gray-400 opacity-70",
        day_disabled: "text-gray-400 opacity-50",
        day_range_middle: "aria-selected:bg-blue-100",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{}}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
