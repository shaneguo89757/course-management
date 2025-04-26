import { IoCalendarNumberOutline } from "react-icons/io5";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "date-fns";

export default function EventDateSection({ selectedDate }: { selectedDate: Date }) {
    return(
      <div>
        <div className="inline-block mb-2">
          <h4 className="event-editor-title">
            <IoCalendarNumberOutline className="h-6 w-6" />日期：
          </h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="h-6 cursor-pointer font-normal border-gray-600 text-gray-600"
          >
            {selectedDate ? formatDate(selectedDate, "yyyy-MM-dd") : ""}
          </Badge>
        </div>
      </div>
    )
  }