export default class Dispositivo {
    nome: string
    potencia: number
    horasUso: number
    constructor(nome: string, potencia: number, horasUso: number) {
        this.nome = nome
        this.potencia = potencia
        this.horasUso = horasUso
    }
    consumoDiarioWh() {
        return this.potencia * this.horasUso
    }
    descricao() {
        return `${this.nome} consome ${this.consumoDiarioWh()} Wh por dia`
    }
}