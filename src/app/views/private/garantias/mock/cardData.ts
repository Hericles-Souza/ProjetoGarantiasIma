import { GarantiasStatusEnum } from "@shared/enums/GarantiasStatusEnum.ts";

export const cardData = Object.values(GarantiasStatusEnum).map((status, index) => {
  return {
    id: index + 1,
    status: status,
    code: `000${index + 1}-0000${index + 1}.${String.fromCharCode(65 + index)}.${String.fromCharCode(65 + index + 1)}`,
    pieceCode: `00012200${index + 1}0`,
    defectValue: `Defeito ${String.fromCharCode(65 + index)}`,
    person: `${String.fromCharCode(65 + index)} ${['Lopes', 'Silva', 'Alves', 'Santos', 'Almeida', 'Oliveira', 'Pereira', 'Lima', 'Souza', 'Costa'][index]}`,
    date: `${index + 1 < 10 ? '0' : ''}${index + 1}/00/2025`,
  };
});

