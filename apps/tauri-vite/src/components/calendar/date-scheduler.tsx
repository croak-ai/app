import { useState, useMemo, useEffect } from "react";
import { Button } from "@acme/ui/components/ui/button";
import { Calendar } from "@acme/ui/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@acme/ui/components/ui/popover";
import { ScrollArea } from "@acme/ui/components/ui/scroll-area";

interface DateSchedulerProps {
  value: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
  minuteInterval: number;
}

const DateScheduler: React.FC<DateSchedulerProps> = ({
  value,
  onChange,
  minuteInterval,
}) => {
  const [fromCalendarOpen, setFromCalendarOpen] = useState(false);
  const [toCalendarOpen, setToCalendarOpen] = useState(false);
  const [fromTimeOpen, setFromTimeOpen] = useState(false);
  const [toTimeOpen, setToTimeOpen] = useState(false);

  const handleDateChange = (date: Date, type: "from" | "to") => {
    const now = new Date();
    if (date < now) return; // Prevent selecting dates before "now"
    if (type === "from") {
      const newToDate = new Date(date);
      newToDate.setMinutes(date.getMinutes() + minuteInterval);
      onChange({
        from: date,
        to: newToDate,
      });
    } else if (type === "to") {
      if (date < value.from) {
        // If the "to" date is before the "from" date, reset both
        const newFromDate = new Date(date);
        newFromDate.setMinutes(date.getMinutes() - minuteInterval);
        onChange({
          from: newFromDate,
          to: date,
        });
      } else {
        onChange({
          ...value,
          [type]: date,
        });
      }
    }
  };

  const handleTimeChange = (time: string, type: "from" | "to") => {
    const now = new Date();
    const newTime = new Date(value[type]);
    const [hours, minutes] = time.split(":").map(Number);
    newTime.setHours(hours, minutes);
    if (newTime < now) return; // Prevent selecting times before "now"

    if (type === "from") {
      const potentialNewTo = new Date(newTime);
      potentialNewTo.setMinutes(newTime.getMinutes() + minuteInterval);
      if (potentialNewTo <= value.to) {
        onChange({
          ...value,
          from: newTime,
        });
      } else {
        onChange({
          from: newTime,
          to: potentialNewTo,
        });
      }
    } else if (type === "to") {
      if (newTime > value.from) {
        onChange({
          ...value,
          to: newTime,
        });
      } else {
        const newFrom = new Date(newTime);
        newFrom.setMinutes(newTime.getMinutes() - minuteInterval);
        onChange({
          from: newFrom,
          to: newTime,
        });
      }
    }
  };

  const generateTimeOptions = (
    dateValue: Date,
    timeEnabled: (time: Date) => boolean,
  ) => {
    const times = [];
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    const endDate = new Date(date).setHours(23, 59, 59, 999);

    while (date.getTime() <= endDate) {
      if (timeEnabled(date) && date >= new Date()) {
        // Ensure time is not before "now"
        times.push(new Date(date));
      }
      date.setMinutes(date.getMinutes() + minuteInterval);
    }

    return times;
  };

  const timeOptionsFrom = useMemo(
    () => generateTimeOptions(value.from, (time) => time > new Date()),
    [value.from, minuteInterval],
  );
  const timeOptionsTo = useMemo(
    () => generateTimeOptions(value.to, (time) => time > value.from),
    [value.to, minuteInterval, value.from],
  );

  return (
    <div>
      <div className="my-2 flex justify-between">
        {/* Calendar Popovers for 'from' date */}
        <Popover
          onOpenChange={() => setFromCalendarOpen(!fromCalendarOpen)}
          open={fromCalendarOpen}
        >
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant={fromCalendarOpen ? "default" : "outline"}
            >
              {value.from
                ? value.from.toLocaleDateString()
                : "Select Start Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              selected={value.from}
              mode="single"
              onSelect={(date) => date && handleDateChange(date, "from")}
              disabled={(date) => date < new Date()} // Ensure calendar does not allow selecting dates before "now"
            />
          </PopoverContent>
        </Popover>
        {/* Calendar Popovers for 'to' date */}
        <Popover
          onOpenChange={() => setToCalendarOpen(!toCalendarOpen)}
          open={toCalendarOpen}
        >
          <PopoverTrigger asChild>
            <Button size="sm" variant={toCalendarOpen ? "default" : "outline"}>
              {value.to ? value.to.toLocaleDateString() : "Select End Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              selected={value.to}
              mode="single"
              onSelect={(date) => date && handleDateChange(date, "to")}
              disabled={(date) => date < value.from || date < new Date()} // Ensure calendar does not allow selecting dates before "now" or before the 'from' date
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="mt-2 flex">
        {/* Time Selection for 'from' */}
        <Popover
          onOpenChange={() => setFromTimeOpen(!fromTimeOpen)}
          open={fromTimeOpen}
        >
          <PopoverTrigger asChild>
            <Button size="sm" variant={fromTimeOpen ? "default" : "outline"}>
              {value.from
                ? value.from.toLocaleTimeString([], {
                    hourCycle: "h23",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Select Start Time"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <ScrollArea>
              <div className="flex flex-col">
                {timeOptionsFrom.map((time, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={
                      value.from && value.from.getTime() === time.getTime()
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      handleTimeChange(
                        time.toLocaleTimeString([], {
                          hourCycle: "h23",
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        "from",
                      )
                    }
                  >
                    {time.toLocaleTimeString([], {
                      hourCycle: "h23",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
        {/* Time Selection for 'to' */}
        <Popover
          onOpenChange={() => setToTimeOpen(!toTimeOpen)}
          open={toTimeOpen}
        >
          <PopoverTrigger asChild>
            <Button size="sm" variant={toTimeOpen ? "default" : "outline"}>
              {value.to
                ? value.to.toLocaleTimeString([], {
                    hourCycle: "h23",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Select End Time"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <ScrollArea>
              <div className="flex flex-col">
                {timeOptionsTo.map((time, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={
                      value.to && value.to.getTime() === time.getTime()
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      handleTimeChange(
                        time.toLocaleTimeString([], {
                          hourCycle: "h23",
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        "to",
                      )
                    }
                  >
                    {time.toLocaleTimeString([], {
                      hourCycle: "h23",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DateScheduler;
