import React, { useState } from 'react';

const BarberSchedule = () => {
  // Definir os horários de trabalho do barbeiro
  const horarioInicioManha = new Date().setHours(8, 0, 0, 0);
  const horarioFimManha = new Date().setHours(12, 0, 0, 0);
  const horarioInicioTarde = new Date().setHours(13, 0, 0, 0);
  const horarioFimTarde = new Date().setHours(18, 0, 0, 0);

  // Definir os tipos de serviço e a duração de cada um
  const servicos = {
    barba: 30,
    cabelo: 60,
  };

  // Estado para controlar o agendamento
  const [horarioAgendado, setHorarioAgendado] = useState('');
  const [tipoServicoAgendado, setTipoServicoAgendado] = useState('');

  // Função para verificar se um horário está disponível
  const verificarDisponibilidade = (horario: any) => {
    const agora = new Date();

    // Verificar se o horário fornecido é no futuro
    if (horario < agora) {
      return false;
    }

    // Verificar se o horário está dentro do horário de trabalho do barbeiro
    const horarioInicio = horario.getHours() * 60 + horario.getMinutes();
    if (
      (horarioInicio >= horarioInicioManha &&
        horarioInicio < horarioFimManha) ||
      (horarioInicio >= horarioInicioTarde && horarioInicio < horarioFimTarde)
    ) {
      return true;
    }

    return false;
  };

  const agendarServico = () => {
    const horario = new Date(horarioAgendado);
    const tipoServico = tipoServicoAgendado;
    if (verificarDisponibilidade(horario)) {
      //@ts-ignore
      const duracao = servicos[tipoServico];
      const horarioFim = new Date(horario.getTime() + duracao * 60000);
      console.log(
        `Serviço agendado: ${tipoServico} - Horário: ${horario} - Término: ${horarioFim}`
      );
    } else {
      console.log(`Horário não disponível: ${horario}`);
    }
  };

  return (
    <div>
      <h2>Tela de Agendamento</h2>
      <div>
        <label>Horário:</label>
        <input
          type='datetime-local'
          value={horarioAgendado}
          onChange={(e) => setHorarioAgendado(e.target.value)}
        />
      </div>
      <div>
        <label>Tipo de Serviço:</label>
        <select
          value={tipoServicoAgendado}
          onChange={(e) => setTipoServicoAgendado(e.target.value)}
        >
          <option value=''>Selecione</option>
          <option value='barba'>Barba</option>
          <option value='cabelo'>Cabelo</option>
        </select>
      </div>
      <button onClick={agendarServico}>Agendar</button>
    </div>
  );
};

export default BarberSchedule;
