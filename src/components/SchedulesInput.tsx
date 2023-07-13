import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";

const ScheduleForm = ({ schedules, onChange }: any) => {
  const [currentDay, setCurrentDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");

  const generateUniqueId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const handleAddSchedule = () => {
    if (!currentDay || !startTime || !endTime) {
      setError("Preencha todos os campos");
      return;
    }

    const newSchedule = {
      id: generateUniqueId(),
      day: currentDay,
      start: startTime,
      end: endTime,
    };

    const hasConflict = schedules.some(
      (schedule: any) =>
        schedule.day === currentDay &&
        ((schedule.start <= startTime && startTime < schedule.end) ||
          (schedule.start < endTime && endTime <= schedule.end))
    );

    if (hasConflict) {
      setError("Já existe um período agendado para esse dia e horário");
      return;
    }

    onChange([...schedules, newSchedule]);
    setCurrentDay("");
    setStartTime("");
    setEndTime("");
    setError("");
  };

  const handleRemoveSchedule = (start: string, end: string, day: string) => {
    const updatedSchedules = schedules.filter(
      (schedule: any) =>
        schedule.start + schedule.end !== start + end || schedule.day !== day
    );
    onChange(updatedSchedules);
  };

  return (
    <Box>
      <FormControl>
        <Stack direction="row" spacing={2} mb={2}>
          <Select
            w={200}
            placeholder="Dia da semana"
            value={currentDay}
            onChange={(e) => setCurrentDay(e.target.value)}
          >
            <option value="segunda">Segunda-feira</option>
            <option value="terca">Terça-feira</option>
            <option value="quarta">Quarta-feira</option>
            <option value="quinta">Quinta-feira</option>
            <option value="sexta">Sexta-feira</option>
            <option value="sabado">Sábado</option>
            <option value="domingo">Domingo</option>
          </Select>
          <Input
            w={100}
            type="time"
            placeholder="Início"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            w={100}
            type="time"
            placeholder="Fim"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <Button colorScheme="blue" onClick={handleAddSchedule}>
            +
          </Button>
        </Stack>
        <FormErrorMessage>{error}</FormErrorMessage>
      </FormControl>
      <VStack align="start" spacing={4}>
        {[
          "segunda",
          "terca",
          "quarta",
          "quinta",
          "sexta",
          "sabado",
          "domingo",
        ].map((day) => (
          <Box key={day}>
            <Text fontWeight="bold">
              {day.charAt(0).toUpperCase() + day.slice(1)}:
            </Text>
            <Flex gap={2} wrap={"wrap"}>
              {schedules
                .filter((schedule: any) => schedule.day === day)
                .map((schedule: any) => (
                  <Box
                    key={schedule.start + schedule.end}
                    boxShadow="0px 0px 5px 0px #ccc"
                    rounded={10}
                    textAlign={"center"}
                    p={2}
                    mt={2}
                  >
                    <Text>
                      {schedule.start} - {schedule.end}
                    </Text>
                    <Button
                      colorScheme="red"
                      size="sm"
                      mt={2}
                      onClick={() =>
                        handleRemoveSchedule(
                          schedule.start,
                          schedule.end,
                          schedule.day
                        )
                      }
                    >
                      Remover
                    </Button>
                  </Box>
                ))}
            </Flex>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default ScheduleForm;
