export default class FazendaAvancada {
    nome: string
    qtdPCs: number
    potenciaPC: number
    qtdGPUs: number
    potenciaGPU: number
    qtdFontes: number
    potenciaFonte: number
    horasUso: number
    constructor(nome: string, qtdPCs: number, potenciaPC: number, qtdGPUs: number, potenciaGPU: number, qtdFontes: number, potenciaFonte: number, horasUso: number) {
        this.nome = nome
        this.qtdPCs = qtdPCs
        this.potenciaPC = potenciaPC
        this.qtdGPUs = qtdGPUs
        this.potenciaGPU = potenciaGPU
        this.qtdFontes = qtdFontes
        this.potenciaFonte = potenciaFonte
        this.horasUso = horasUso
    }
    consumoDiarioWh() {
        const consumoPorPC = this.potenciaPC + (this.qtdGPUs * this.potenciaGPU) + (this.qtdFontes * this.potenciaFonte)
        return consumoPorPC * this.qtdPCs * this.horasUso
    }
    descricao() {
        return `${this.nome} - PCs: ${this.qtdPCs}, GPUs/PC: ${this.qtdGPUs}, Fontes/PC: ${this.qtdFontes}, Consumo diário: ${this.consumoDiarioWh()} Wh`
    }
}