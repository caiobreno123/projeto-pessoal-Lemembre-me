export default class FazendaAvancada {
  constructor(
    public numeroRigs: number,
    public potenciaPorRig: number, // watts
    public horasPorDia: number
  ) {}

  consumoDiarioKwh(): number {
    // total watts * hours / 1000
    return (this.numeroRigs * this.potenciaPorRig * this.horasPorDia) / 1000;
  }
}
