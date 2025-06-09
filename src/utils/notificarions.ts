import moment from 'moment';

export const getScheduleNotification = (
  sheduleId: string,
  clientName: string,
  professionalName: string,
  companyName: string,
  servicesNames: any,
  date: string,
  hour: string
) => {
  let notification = `Novo agendamento para *${professionalName}* da *${companyName}*! \n\n`;
  notification += `Nome do cliente: *${clientName}*\n\n`;
  notification += `${
    servicesNames.length > 1 ? 'Serviços:' : 'Serviço:'
  } *${servicesNames.map((s: any, i: number) =>
    i < servicesNames.length ? s : s + ', '
  )}*. \n\n`;
  notification += `Data: *${date} as ${hour}*.\n\n`;
  notification += `Caso queira cancelar, basta acessar o link abaixo: \n`;
  notification += `${process.env.NEXT_PUBLIC_API_URL}/a/${sheduleId}`;

  return notification;
};

export const remaindMessage = (schedule: any, isToday = false): string =>
  `Olá *${
    schedule.client.name
  }*, passando para te lembrar do nosso agendamento ${
    isToday ? 'HOJE' : moment(schedule.date, 'YYYY-MM-DD').format('LL')
  } as *${schedule.time}*. Te aguardo. 😁`;
