const pad = (value: number, size = 2) => String(value).padStart(size, "0");

/**
 * Partes da data/hora local já formatadas (com zero à esquerda).
 * Substitui o bloco de 8 linhas que estava copiado em cada tela.
 */
export const dateParts = (now = new Date()) => ({
  year: now.getFullYear(),
  month: pad(now.getMonth() + 1),
  day: pad(now.getDate()),
  hours: pad(now.getHours()),
  minutes: pad(now.getMinutes()),
  seconds: pad(now.getSeconds()),
  milliseconds: pad(now.getMilliseconds(), 3),
});

/** Data no formato que o backend espera em dataAtualizacao: "AAAA-MM-DD hh:mm:ss.mmm". */
export const nowDataAtualizacao = () => {
  const { year, month, day, hours, minutes, seconds, milliseconds } = dateParts();
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};
