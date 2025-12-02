import Eletrodomestico from "./Eletrodomestico"
import FazendaAvancada from "./FazendaAvancada"
import Dispositivo from "./Dispositivo"
export default class DispositivoFactory {
    static criarEletro(nome: string, potencia: number, horas: number, ambiente: string): Dispositivo {
        return new Eletrodomestico(nome, potencia, horas, ambiente)
    }
    static criarFazendaAvancada(nome: string, qtdPCs: number, potenciaPC: number, qtdGPUs: number, potenciaGPU: number, qtdFontes: number, potenciaFonte: number, horas: number) {
        return new FazendaAvancada(nome, qtdPCs, potenciaPC, qtdGPUs, potenciaGPU, qtdFontes, potenciaFonte, horas)
    }
}