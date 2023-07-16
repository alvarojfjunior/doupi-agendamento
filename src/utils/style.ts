export function getFontColor(background: string): string {
  // Extrai os componentes RGB da cor de fundo
  const red = parseInt(background.substr(1, 2), 16);
  const green = parseInt(background.substr(3, 2), 16);
  const blue = parseInt(background.substr(5, 2), 16);

  // Calcula a luminosidade da cor de fundo usando a fórmula de luminosidade relativa
  const luminosidade = (red * 0.299 + green * 0.587 + blue * 0.114) / 255;

  // Determina a melhor cor de fonte com base na luminosidade
  const corFonte = luminosidade > 0.5 ? '#000000' : '#FFFFFF';

  return corFonte;
}


export function modifyTheme(cor: string, transparencia: number): string {
  // Remove o caractere "#" se estiver presente
  const corLimpa = cor.replace('#', '');

  // Converte a cor em formato hexadecimal para RGBA
  const red = parseInt(corLimpa.substr(0, 2), 16);
  const green = parseInt(corLimpa.substr(2, 2), 16);
  const blue = parseInt(corLimpa.substr(4, 2), 16);

  // Calcula os valores RGBA com a transparência
  const redComTransparencia = Math.round((1 - transparencia) * red + transparencia * 255);
  const greenComTransparencia = Math.round((1 - transparencia) * green + transparencia * 255);
  const blueComTransparencia = Math.round((1 - transparencia) * blue + transparencia * 255);

  // Converte os valores RGBA para o formato hexadecimal
  const redHex = redComTransparencia.toString(16).padStart(2, '0');
  const greenHex = greenComTransparencia.toString(16).padStart(2, '0');
  const blueHex = blueComTransparencia.toString(16).padStart(2, '0');

  // Retorna a cor com o valor de transparência adicionado, no formato hexadecimal
  return `#${redHex}${greenHex}${blueHex}`;
}
