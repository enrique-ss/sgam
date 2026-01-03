import { AuthService } from './AuthService';
import { PedidoService } from './PedidoService';

export const CronService = {
    iniciar() {
        // Executa a cada 1 hora
        setInterval(async () => {
            try {
                console.log('🔄 Verificando inatividade de colaboradores...');
                await AuthService.verificarInatividade();

                console.log('🔄 Atualizando status de pedidos atrasados...');
                await PedidoService.atualizarStatusAtrasados();
            } catch (error) {
                console.error('❌ Erro no cron:', error);
            }
        }, 60 * 60 * 1000); // 1 hora

        console.log('✅ Cron jobs iniciados');
    }
};