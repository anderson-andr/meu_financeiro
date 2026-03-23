export interface MonthReferenceParts {
    mes: number;
    ano: number;
    referencia: string;
}

const isValidMonth = (value: number) => Number.isInteger(value) && value >= 1 && value <= 12;
const isValidYear = (value: number) => Number.isInteger(value) && value >= 1900 && value <= 9999;

export const buildReferencia = (mes: number, ano: number) => `${String(mes).padStart(2, "0")}-${ano}`;

export function parseMonthReference(input: {
    mes?: unknown;
    ano?: unknown;
    mesReferencia?: unknown;
    referencia?: unknown;
}): MonthReferenceParts {
    const mes = Number(input.mes);
    const ano = Number(input.ano);

    if (isValidMonth(mes) && isValidYear(ano)) {
        return { mes, ano, referencia: buildReferencia(mes, ano) };
    }

    const raw = String(input.mesReferencia ?? input.referencia ?? "").trim();
    const parts = raw.split("-");
    if (parts.length === 2) {
        const first = Number(parts[0]);
        const second = Number(parts[1]);

        if (isValidMonth(first) && isValidYear(second)) {
            return { mes: first, ano: second, referencia: buildReferencia(first, second) };
        }

        if (isValidYear(first) && isValidMonth(second)) {
            return { mes: second, ano: first, referencia: buildReferencia(second, first) };
        }
    }

    throw new Error("Mês de referência inválido. Informe mes/ano ou mesReferencia no formato MM-YYYY.");
}
