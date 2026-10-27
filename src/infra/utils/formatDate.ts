export function formatDate(date: Date) {

  const format = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const dateFormated: string = format.format(date);
  return dateFormated;
}
