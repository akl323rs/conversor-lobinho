

let equivalencias = [];

fetch('equivalencias.json')
  .then(res => res.json())
  .then(data => {
    equivalencias = data;
    console.log('Equivalências carregadas:', equivalencias.length);
  });

document.getElementById('btnGerar').addEventListener('click', () => {

  const confirmado = document.getElementById('confirmacao').checked;

  if (!confirmado) {
    alert('Você precisa confirmar a leitura do aviso antes de continuar.');
    return;
  }

  const texto = document.getElementById('inputTexto').value;

  if (!texto.trim()) {
    alert('Cole o relatório do Paxtu.');
    return;
  }

  const linhas = texto.split(/\r?\n/);

  const resultados = [];

  linhas.forEach(linha => {

    linha = linha.trim();

    // Procura:
    // F1 Texto 19/07/2025
    // A2 Texto Informe a data

    const match = linha.match(
      /^([A-Z]+\d+)\s+.*?(\d{2}\/\d{2}\/\d{4}|Informe a data)/i
    );

    if (!match) return;

    const codigo = match[1].trim().toUpperCase();

    const data = match[2];

    // Ignora itens não concluídos
    if (data.toLowerCase().includes('informe')) {
      return;
    }

    // Busca equivalências
    const equivalentes = equivalencias.filter(eq =>
      eq.codigoAntigo &&
      eq.codigoAntigo.toString().trim().toUpperCase() === codigo
    );

    equivalentes.forEach(eq => {

      resultados.push({
        codigoAntigo: eq.codigoAntigo || '',
        itemAntigo: eq.itemAntigo || '',
        codigoNovo: eq.codigoNovo || '',
        itemNovo: eq.itemNovo || '',
        data: data,
        bloco: eq.bloco || ''
      });

    });

  });

  renderizarTabela(resultados);

});

function renderizarTabela(resultados) {

  const div = document.getElementById('resultado');

  if (resultados.length === 0) {

    div.innerHTML = `
      <p>Nenhuma equivalência encontrada.</p>
    `;

    document.getElementById('btnCopiar').style.display = 'none';

    return;
  }

  let html = `
    <table id="tabelaResultado">
      <thead>
        <tr>
          <th>Código Antigo</th>
          <th>Item Antigo</th>
          <th>Código Novo</th>
          <th>Item Novo</th>
          <th>Data</th>
          <th>Bloco</th>
        </tr>
      </thead>
      <tbody>
  `;

  resultados.forEach(r => {

    html += `
      <tr>
        <td>${r.codigoAntigo}</td>
        <td>${r.itemAntigo}</td>
        <td>${r.codigoNovo}</td>
        <td>${r.itemNovo}</td>
        <td>${r.data}</td>
        <td>${r.bloco}</td>
      </tr>
    `;

  });

  html += `
      </tbody>
    </table>
  `;

  div.innerHTML = html;

  document.getElementById('btnCopiar').style.display = 'inline-block';

  configurarCopia();

}

function configurarCopia() {

  const btn = document.getElementById('btnCopiar');

  btn.onclick = () => {

    const tabela = document.getElementById('tabelaResultado');

    let texto = '';

    for (const row of tabela.rows) {

      const cols = Array.from(row.cells).map(cell => cell.innerText);

      texto += cols.join('\t') + '\n';

    }

    navigator.clipboard.writeText(texto);

    alert('Tabela copiada! Agora você pode colar no Excel.');

  };

}



