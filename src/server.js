require('dotenv').config();
const app = require('./app');
const prisma = require('./config/prisma');

const PORT = process.env.PORT || 5000;

/**
 * Conecta ao banco e inicia o servidor de forma segura
 */
const iniciarServidor = async () => {
  try {
    // Testar conexão com o Prisma
    await prisma.$connect();
    console.log('Conectado ao banco de dados MySQL via Prisma.');

    const server = app.listen(PORT, () => {
      console.log(`🚀 FleetFlow API rodando em http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV}`);
    });

    // Encerramento seguro
    const encerrar = async (sinal) => {
      console.log(`\n⚡ Sinal ${sinal} recebido. Encerrando com segurança...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('🔌 Prisma desconectado. Servidor encerrado.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => encerrar('SIGINT'));
    process.on('SIGTERM', () => encerrar('SIGTERM'));

  } catch (error) {
    console.error('❌ Falha ao conectar ao banco de dados:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
};

iniciarServidor();
