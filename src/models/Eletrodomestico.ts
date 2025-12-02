import Dispositivo from "./Dispositivo"
export default class Eletrodomestico extends Dispositivo {
    ambiente: string
    constructor(nome: string, potencia: number, horasUso: number, ambiente: string) {
        super(nome, potencia, horasUso)
        this.ambiente = ambiente
    }
    descricao() {
        return `${this.nome} - Ambiente: ${this.ambiente}, Consumo diário: ${this.consumoDiarioWh()} Wh`
    }
}