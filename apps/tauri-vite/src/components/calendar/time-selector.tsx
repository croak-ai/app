import { ScrollArea } from "@acme/ui/components/ui/scroll-area";
import { Button } from "@acme/ui/components/ui/button";

interface TimeSelectorProps {
  interval: number;
  onTimeSelect: (time: string) => void;
  selectedTime: Date;
  timeEnabled: (time: Date) => boolean;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  interval,
  onTimeSelect,
  selectedTime,
  timeEnabled,
}) => {
  const generateTimeOptions = () => {
    const times = [];
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    const endDate = new Date(date).setHours(23, 59, 59, 999);

    while (date.getTime() <= endDate) {
      if (timeEnabled(date)) {
        times.push(new Date(date));
      }
      date.setMinutes(date.getMinutes() + interval);
    }

    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <ScrollArea>
      <div className="flex flex-col">
        {timeOptions.map((time, index) => (
          <Button
            key={index}
            size="sm"
            variant={
              selectedTime && selectedTime.getTime() === time.getTime()
                ? "default"
                : "outline"
            }
            onClick={() =>
              onTimeSelect(
                time.toLocaleTimeString([], {
                  hourCycle: "h23",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
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
  );
};

export default TimeSelector;
