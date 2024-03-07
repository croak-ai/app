import { useState, useMemo, useEffect } from "react";
import { Button } from "@acme/ui/components/ui/button";
import { Calendar } from "@acme/ui/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@acme/ui/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@acme/ui/components/ui/command";
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

  useEffect(() => {
    console.log(value);
  }, [value]);

  const handleFromDateChange = (newFromDate: Date) => {
    const now = new Date();
    if (newFromDate < now) return; // Prevent selecting dates or times before "now"
    const newToDate = new Date(newFromDate);
    newToDate.setMinutes(newFromDate.getMinutes() + minuteInterval);
    onChange({
      from: newFromDate,
      to: newToDate,
    });
  };

  const handleToDateChange = (newToDate: Date) => {
    const now = new Date();
    if (newToDate < now || newToDate < value.from) return; // Prevent selecting dates or times before "now" or before the 'from' date
    onChange({
      ...value,
      to: newToDate,
    });
  };

  const generateToTimeOptions = (dateToValue: Date, dateFromValue: Date) => {
    const times = [];
    // Create a new Date object for toDate without mutating dateToValue
    const toDate = new Date(dateToValue);
    toDate.setHours(0, 0, 0, 0); // Set to start of the day without mutating the original dateToValue

    const fromDate = new Date(dateFromValue);

    while (times.length < (60 / minuteInterval) * 24) {
      if (toDate > fromDate) {
        times.push(new Date(toDate));
      }
      toDate.setMinutes(toDate.getMinutes() + minuteInterval);
    }

    return times;
  };
  const generateFromTimeOptions = (dateFromValue: Date) => {
    const times = [];
    const now = new Date();
    // Create a new Date object for startOfDay without mutating dateFromValue
    const startOfDay = new Date(dateFromValue);
    startOfDay.setHours(0, 0, 0, 0); // Set to start of the day without mutating the original dateFromValue

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999); // End of the selected day

    while (startOfDay.getTime() <= endOfDay.getTime()) {
      if (startOfDay >= now && startOfDay >= dateFromValue) {
        times.push(new Date(startOfDay));
      }
      startOfDay.setMinutes(startOfDay.getMinutes() + minuteInterval);
    }

    return times;
  };

  const timeOptionsFrom = useMemo(
    () => generateFromTimeOptions(value.from),
    [value.from, minuteInterval],
  );
  const timeOptionsTo = useMemo(
    () => generateToTimeOptions(value.to, value.from),
    [value.to, minuteInterval, value.from],
  );

  return (
    <>
      {JSON.stringify(value)}
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
              onSelect={(date) => date && handleFromDateChange(date)}
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
              onSelect={(date) => date && handleToDateChange(date)}
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
          <PopoverContent className="w-auto p-0 " align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  {timeOptionsFrom.map((time, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => {
                        handleFromDateChange(time);
                        setFromTimeOpen(false);
                      }}
                      className="mx-2 pl-2 text-sm"
                    >
                      {time.toLocaleTimeString([], {
                        hourCycle: "h23",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
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
          <PopoverContent className="w-auto p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  {timeOptionsTo.map((time, index) => {
                    const durationInMinutes = Math.floor(
                      (time.getTime() - value.from.getTime()) / (1000 * 60),
                    );
                    const days = Math.floor(durationInMinutes / (60 * 24));
                    const daysString = days > 0 ? `${days}d` : "";

                    const hours = Math.floor(
                      (durationInMinutes % (60 * 24)) / 60,
                    );
                    const hoursString = hours > 0 ? `${hours}h ` : "";

                    const minutes = durationInMinutes % 60;
                    const minutesString = minutes > 0 ? `${minutes}m` : "";

                    return (
                      <CommandItem
                        key={index}
                        onSelect={() => {
                          handleToDateChange(time);
                          setToTimeOpen(false);
                        }}
                        className="mx-2 pl-2 text-sm"
                      >
                        <span className="pr-4">
                          {`${time.getHours()}:${time
                            .getMinutes()
                            .toString()
                            .padStart(2, "0")}`}
                        </span>
                        <span className="text-xs font-semibold">{`(${daysString} ${hoursString} ${minutesString} )`}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};

export default DateScheduler;
