import React, { useState, useEffect } from 'react';
import { Flex, Button, Text } from '@chakra-ui/react';
import moment from 'moment';
import { modifyTheme, pulsate } from '@/utils/style';
interface ScheduleAvailabilityProps {
  color?: String;
  date: Date;
  workPeriods: { start: string; end: string }[];
  unavailableTimes: { time: string; duration: string }[];
  scheduleDuration: string;
  handlChange: Function;
  interval: number;
}

const ScheduleAvailability: React.FC<ScheduleAvailabilityProps> = ({
  color = 'blue.900',
  interval,
  date,
  workPeriods,
  unavailableTimes,
  scheduleDuration,
  handlChange,
}) => {
  const [availableTimes, setScheduleAvailability] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (moment(date, 'YYYY-MM-DD').isBefore(moment().subtract('day', 1))) {
      setScheduleAvailability([]);
    } else {
      showScheduleAvailabilityPerDay();
    }
  }, [date, interval]);

  function convertToMinutes(time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function formatTime(minutes: number) {
    const hours = Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
  }

  function showScheduleAvailabilityPerDay(): any {
    const durationInMinutes = convertToMinutes(scheduleDuration);

    const unavailableMinutes = unavailableTimes.flatMap((period: any) => {
      const startTime = convertToMinutes(period.time);
      const endTime = startTime + convertToMinutes(period.duration);
      return Array.from(
        { length: (endTime - startTime) / interval },
        (_, i) => startTime + i * interval
      );
    });

    const availableTimes = [];

    for (const period of workPeriods) {
      const startTime = convertToMinutes(period.start);
      const endTime = convertToMinutes(period.end);

      for (
        let minutes = startTime;
        minutes <= endTime - durationInMinutes;
        minutes += interval
      ) {
        const isAvailable = !unavailableMinutes.some(
          (time: any) => time >= minutes && time < minutes + durationInMinutes
        );
        if (isAvailable) {
          const startHour = formatTime(minutes);
          const endHour = formatTime(minutes + durationInMinutes);
          availableTimes.push(`${startHour} - ${endHour}`);
        }
      }
    }

    let res = availableTimes;

    if (
      moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY') ===
      moment().format('DD/MM/YYYY')
    ) {
      res = removePastTimes(res);
    }

    setScheduleAvailability(res);
  }

  function removePastTimes(availableTimes: any) {
    const currentTime = new Date();
    const currentMinutes =
      currentTime.getHours() * 60 + currentTime.getMinutes();

    return availableTimes.filter((t: any) => {
      const [startHour, startMinute] = t.split(' ')[0].split(':').map(Number);
      const startTimeInMinutes = startHour * 60 + startMinute;

      return startTimeInMinutes >= currentMinutes;
    });
  }

  return (
    <Flex gap={2} wrap={'wrap'} justifyContent={'center'}>
      {availableTimes.length > 0 ? (
        availableTimes.map((t: any, i: number) => (
          <Button
            animation={`${
              (i === 0 && selectedIndex === -1) && pulsate
            } 1.5s infinite`}
            //@ts-ignore
            bgColor={i === selectedIndex ? color : modifyTheme(color, 0.2)}
            boxShadow={i === selectedIndex ? `0px 0px 10px 3px black` : 'none'}
            //@ts-ignore
            _hover={{ bgColor: color }}
            color={'white'}
            onClick={() => {
              setSelectedIndex(i);
              handlChange(t.split(' - ')[0]);
            }}
            w={'110px'}
            key={t}
          >
            {' '}
            {t}{' '}
          </Button>
        ))
      ) : (
        <Text>
          {' '}
          {scheduleDuration
            ? 'Não existe horário para esta data.'
            : 'Você deve selecionar serviço e data para mostrar a lista de horários'}{' '}
        </Text>
      )}
    </Flex>
  );
};

export default ScheduleAvailability;
