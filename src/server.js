const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

async function iniciarServidor() {
  try {
    // Autentica e sincroniza as tabelas com o banco de dados
    await sequelize.authenticate();
    console.log('[Banco de Dados]: Conexão com o MySQL estabelecida com sucesso.');

    // Sincroniza as tabelas caso ainda não existam
    await sequelize.sync();
    console.log('[Banco de Dados]: Modelos sincronizados com o banco de dados.');

    app.listen(PORT, () => {
      console.log(`[Servidor]: dripStoreBackend rodando na porta ${PORT}`);
      console.log(`[Swagger]: Documentação disponível em: http://localhost:${PORT}/swagger`);
    });
  } catch (error) {
    console.error('[Erro]: Não foi possível conectar ao banco de dados:', error.message);
    process.exit(1);
  }
}

iniciarServidor();
