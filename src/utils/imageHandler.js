const fs = require('fs');
const path = require('path');

/**
 * Salva uma imagem em Base64 no disco e retorna o caminho relativo/URL
 * @param {string} content - Conteúdo em base64 ou URL direta
 * @param {string} type - MIME type (ex: image/png)
 * @returns {string} Caminho relativo ou URL da imagem
 */
const salvarImagemBase64 = (content, type = 'image/png') => {
  if (!content) return '';

  // Se já for uma URL externa ou caminho existente, retorna direto
  if (content.startsWith('http://') || content.startsWith('https://') || content.startsWith('/uploads/')) {
    return content;
  }

  try {
    const uploadDir = path.resolve(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Remover prefixo data:image/...;base64, caso exista
    const base64Data = content.replace(/^data:image\/\w+;base64,/, '');
    const extension = type.split('/')[1] || 'png';
    const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Erro ao salvar imagem em disco:', err);
    // Em caso de falha de I/O, retorna o próprio conteúdo original para não perder o dado
    return content;
  }
};

module.exports = {
  salvarImagemBase64
};

