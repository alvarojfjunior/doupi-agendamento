import { Button, Grid } from '@chakra-ui/react';

interface WorkPeriod {
  start: string;
  end: string;
}

interface InvalidAppointment {
  start: string;
  end: string;
}

interface AvailableTimesListProps {
  durationToTest: string;
  invalidAppointments: InvalidAppointment[];
  workPeriods: WorkPeriod[];
  handleSelectTime: Function;
  date: Date;
  value: string;
}

const AvailableTimesList: React.FC<AvailableTimesListProps> = ({
  durationToTest,
  invalidAppointments,
  workPeriods,
  handleSelectTime,
  date,
  value,
}) => {
  const generateAvailableTimes = () => {
    const now = new Date();
    const currentTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const adjustedWorkPeriods = adjustWorkPeriods(currentTime);
    const adjustedInvalidAppointments = adjustInvalidAppointments(currentTime);

    const availableTimes: string[] = [];

    adjustedWorkPeriods.forEach((workPeriod) => {
      const { start, end } = workPeriod;
      let current = start;

      while (current <= end) {
        const endTime = addTimes(current, durationToTest);

        if (isValidTime(current, endTime, adjustedInvalidAppointments)) {
          availableTimes.push(current);
        }

        current = addTimes(current, '00:30');
      }
    });

    return availableTimes;
  };

  const adjustWorkPeriods = (currentTime: string) => {
    const adjustedWorkPeriods: WorkPeriod[] = [];

    workPeriods.forEach((workPeriod) => {
      const { start, end } = workPeriod;

      if (currentTime <= end) {
        adjustedWorkPeriods.push({ start, end });
      }
    });

    return adjustedWorkPeriods;
  };

  const adjustInvalidAppointments = (currentTime: string) => {
    const adjustedInvalidAppointments: InvalidAppointment[] = [];

    invalidAppointments.forEach((appointment) => {
      const { start, end } = appointment;

      if (currentTime <= end) {
        adjustedInvalidAppointments.push({ start, end });
      }
    });

    return adjustedInvalidAppointments;
  };

  const addTimes = (time1: string, time2: string) => {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);

    let hours = hours1 + hours2;
    let minutes = minutes1 + minutes2;

    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes %= 60;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}`;
  };

  const isValidTime = (
    startTime: string,
    endTime: string,
    adjustedInvalidAppointments: InvalidAppointment[]
  ) => {
    const invalidAppointmentFound = adjustedInvalidAppointments.some(
      (appointment) =>
        (startTime >= appointment.start && startTime < appointment.end) ||
        (endTime > appointment.start && endTime <= appointment.end)
    );

    return !invalidAppointmentFound;
  };

  const availableTimes = generateAvailableTimes();

  return (
    <Grid
      templateColumns={[
        'repeat(2, 1fr)',
        'repeat(4, 1fr)',
        'repeat(6, 1fr)',
        'repeat(10, 1fr)',
      ]}
      gap={1}
      mt={1}
    >
      {availableTimes.length > 0 ? (
        availableTimes.map((time) => (
          <Button
            //@ts-ignore
            bgColor={time === value && 'blue.500'}
            key={time}
            onClick={() => handleSelectTime(time)}
          >
            {time}
          </Button>
        ))
      ) : (
        <Button>No available times.</Button>
      )}
    </Grid>
  );
};

export default AvailableTimesList;
