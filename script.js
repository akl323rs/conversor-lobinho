
let equivalencias = [];

fetch('equivalencias.json')
  .then(res => res.json())
  .then(data => {
    equivalencias = data;
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

  for (let i = 0; i < linhas.length; i++) {

    const linha = linhas[i].trim();

    const codigoMatch = linha.match(/^([A-Z]+\d+)\s+/);

    if (!codigoMatch) continue;

    const codigo = codigoMatch[1];

    let data = null;

    for (let j = i + 1; j <= i + 3 && j < linhas.length; j++) {

      const proxLinha = linhas[j].trim();

      if (/^\d{2}\/\d{2}\/\d{4}$/.test(proxLinha)) {
        data = proxLinha;
        break;
      }

      if (proxLinha.toLowerCase().includes('informe a data')) {
        break;
      }
    }

    if (!data) continue;

    const equivalentes = equivalencias.filter(eq => eq.codigoAntigo === codigo);

    equivalentes.forEach(eq => {
      resultados.push({
        codigoNovo: eq.codigoNovo,
        itemNovo: eq.itemNovo,
        data: data,
        bloco: eq.bloco
      });
    });
  }

  renderizarTabela(resultados);
});

function renderizarTabela(resultados) {

  const div = document.getElementById('resultado');

  if (resultados.length === 0) {
    div.innerHTML = '<p>Nenhuma equivalência encontrada.</p>';
    document.getElementById('btnCopiar').style.display = 'none';
    return;
  }

  let html = `
    <table id="tabelaResultado">
      <thead>
        <tr>
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
        <td>${r.codigoNovo}</td>
        <td>${r.itemNovo}</td>
        <td>${r.data}</td>
        <td>${r.bloco}</td>
      </tr>
    `;
  });

  html += '</tbody></table>';

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
