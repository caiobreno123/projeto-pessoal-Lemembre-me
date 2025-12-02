import Dispositivo from "./Dispositivo";

export default class Eletrodomestico extends Dispositivo {
  constructor(id: number | null, nome: string, potencia: number, horasUso: number, public ambiente: string) {
    super(id, nome, potencia, horasUso);
  }
}
