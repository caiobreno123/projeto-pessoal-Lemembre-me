export default class Dispositivo {
  constructor(
    public id: number | null,
    public nome: string,
    public potencia: number, // watts
    public horasUso: number // horas por dia
  ) {}
}
