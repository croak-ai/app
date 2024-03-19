import { useState, useMemo, useEffect } from "react";
import { Button } from "@acme/ui/components/ui/button";
import { Calendar } from "@acme/ui/components/ui/calendar";
import { CalendarClock } from "lucide-react";
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

  const timeToString = (durationInMinutes: number) => {
    const days = Math.floor(durationInMinutes / (60 * 24));
    const daysString = days > 0 ? `${days}d` : "";

    const hours = Math.floor((durationInMinutes % (60 * 24)) / 60);
    const hoursString = hours > 0 ? `${hours}h ` : "";

    const minutes = durationInMinutes % 60;
    const minutesString = minutes > 0 ? `${minutes}m` : "";

    return `${daysString} ${hoursString} ${minutesString}`.trim();
  };

  const handleFromDateChange = (newFromDate: Date) => {
    const initalInterval = new Date();
    initalInterval.setMinutes(
      Math.ceil(initalInterval.getMinutes() / minuteInterval) * minuteInterval,
    );

    if (newFromDate < initalInterval) {
      onChange({
        from: initalInterval,
        to: new Date(initalInterval.getTime() + minuteInterval * 60 * 1000),
      });
      return;
    }
    const newToDate = new Date(newFromDate);
    newToDate.setMinutes(newFromDate.getMinutes() + minuteInterval);
    onChange({
      from: newFromDate,
      to: newToDate,
    });
  };

  const handleToDateChange = (newToDate: Date) => {
    if (newToDate <= value.from) {
      const adjustedToDate = new Date(
        value.from.getTime() + minuteInterval * 60 * 1000,
      );
      onChange({
        ...value,
        to: adjustedToDate,
      });
      return;
    }
    onChange({
      ...value,
      to: newToDate,
    });
  };

  const generateToTimeOptions = (dateToValue: Date, dateFromValue: Date) => {
    const times = [];
    const toDate = new Date(dateToValue);
    toDate.setHours(0, 0, 0, 0);

    const fromDate = new Date(dateFromValue);

    while (times.length < (60 / minuteInterval) * 24 - 1) {
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
    const startOfDay = new Date(dateFromValue);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    while (startOfDay.getTime() <= endOfDay.getTime()) {
      if (startOfDay >= now && startOfDay >= dateFromValue) {
        times.push(new Date(startOfDay));
      }
      startOfDay.setMinutes(startOfDay.getMinutes() + minuteInterval);
    }

    return times;
  };

  const timeOptionsFrom = useMemo(() => {
    const fromWithFirstHour = new Date(value.from);
    fromWithFirstHour.setHours(0, 0, 0, 0);
    return generateFromTimeOptions(fromWithFirstHour);
  }, [value.from, minuteInterval]);
  const timeOptionsTo = useMemo(
    () => generateToTimeOptions(value.to, value.from),
    [value.to, minuteInterval, value.from],
  );

  return (
    <>
      <div className="ml-2">From</div>
      <div className="space-x-4">
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
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
              className="p-0" // for some reason the p-3 doesn't apply to the right of the calendar so we just disable it with tailwind merge
            />
          </PopoverContent>
        </Popover>
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
      </div>
      <div className="flex items-center">
        <span className="ml-2">Until</span>
      </div>
      <div className="space-x-4">
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
              disabled={(date) =>
                date.setHours(0, 0, 0, 0) < value.from.setHours(0, 0, 0, 0)
              }
              className="p-0"
            />
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
                    const timeString = timeToString(durationInMinutes);

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
                        <span className="text-xs font-semibold">{`(${timeString})`}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="items-cente ml-2 flex">
        <CalendarClock className="mr-2 h-4 w-4" />
        <span className="text-xs font-semibold">
          {timeToString(
            Math.floor(
              (value.to.getTime() - value.from.getTime()) / (1000 * 60),
            ),
          )}{" "}
          long
        </span>
      </div>
    </>
  );
};

export default DateScheduler;
