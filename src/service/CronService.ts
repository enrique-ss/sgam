import { AuthService } from './AuthService';
import { PedidoService } from './PedidoService';

export class CronService {
  private static intervalId: NodeJS.Timeout | null = null;

  // Iniciar jobs automáticos
  static iniciar(): void {
    console.log('🤖 Iniciando jobs automáticos...');

    // Executar a cada 1 hora
    this.intervalId = setInterval(async () => {
      try {
        await this.executarJobs();
      } catch (error) {
        console.error('❌ Erro ao executar jobs automáticos:', error);
      }
    }, 60 * 60 * 1000); // 1 hora em milissegundos

    // Executar imediatamente na inicialização
    this.executarJobs();
  }

  // Parar jobs automáticos
  static parar(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Jobs automáticos parados');
    }
  }

  // Executar todos os jobs
  private static async executarJobs(): Promise<void> {
    console.log('🔄 Executando jobs automáticos...');

    try {
      // Job 1: Verificar inatividade de colaboradores
      await AuthService.verificarInatividade();
      console.log('✅ Verificação de inatividade concluída');

      // Job 2: Verificar pedidos atrasados
      await PedidoService.verificarPedidosAtrasados();
      console.log('✅ Verificação de pedidos atrasados concluída');

    } catch (error) {
      console.error('❌ Erro em jobs automáticos:', error);
    }
  }

  // Executar manualmente (útil para testes)
  static async executarManualmente(): Promise<void> {
    console.log('🔧 Executando jobs manualmente...');
    await this.executarJobs();
  }
}