import Dispositivo from "./Dispositivo"
export default class Cadastro {
    dispositivos: Dispositivo[]
    constructor() {
        this.dispositivos = []
    }
    adicionar(dispositivo: Dispositivo) {
        this.dispositivos.push(dispositivo)
    }
    listarComTotal() {
        let total = 0
        const linhas = this.dispositivos.map(d => {
            const consumo = (d as any).consumoDiarioWh ? (d as any).consumoDiarioWh() : 0
            total += consumo
            return (d as any).descricao ? (d as any).descricao() : ''
        })
        linhas.push(`Consumo total diário: ${total} Wh`)
        return linhas.join('\n')
    }
    totalWh() {
        return this.dispositivos.reduce((s, d) => s + ((d as any).consumoDiarioWh ? (d as any).consumoDiarioWh() : 0), 0)
    }
}