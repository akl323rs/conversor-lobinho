
let equivalencias = [];

fetch('equivalencias.json')
  .then(res => res.json())
  .then(data => {

    equivalencias = data["Equivalência Itens"];

    console.log(
      'Equivalências carregadas:',
      equivalencias.length
    );

  })
  .catch(err => {

    console.error(err);

    alert(
      'Erro ao carregar o banco de equivalências.'
    );

  });

document
  .getElementById('btnGerar')
  .addEventListener('click', () => {

    const confirmado =
      document.getElementById('confirmacao').checked;

    if (!confirmado) {

      alert(
        'Você precisa confirmar a leitura do aviso antes de continuar.'
      );

      return;
    }

    const texto =
      document.getElementById('inputTexto').value;

    if (!texto.trim()) {

      alert(
        'Cole o relatório do Paxtu.'
      );

      return;
    }

    const linhas = texto.split(/\r?\n/);

    const resultados = [];

    linhas.forEach(linha => {

      linha = linha.trim();

      /*
        Exemplo esperado:

        F1 Texto do item 19/07/2025
        A2 Texto do item Informe a data
      */

      const match = linha.match(
        /^([A-Z]+\d+)\s+(.+?)\s+(\d{2}\/\d{2}\/\d{4}|Informe a data)$/i
      );

      if (!match) return;

      const codigo =
        match[1]
          .trim()
          .toUpperCase();

      const itemAntigo =
        match[2]
          .trim();

      const data =
        match[3];

      // Ignora itens não concluídos

      if (
        data.toLowerCase().includes('informe')
      ) {
        return;
      }

      // Busca equivalências

      const equivalentes =
        equivalencias.filter(eq =>

          eq["Código antigo"] &&

          eq["Código antigo"]
            .toString()
            .trim()
            .toUpperCase() === codigo

        );

      equivalentes.forEach(eq => {

        resultados.push({

          codigoAntigo:
            eq["Código antigo"] || '',

          itemAntigo:
            itemAntigo || eq["Item Antigo"] || '',

          itemNovo:
            eq["Item Novo"] || '',

          bloco:
            eq["Bloco"] || '',

          palavraChave:
            eq["Palavra chave"] || '',

          data:
            data

        });

      });

    });

    renderizarTabela(resultados);

  });

function renderizarTabela(resultados) {

  const div =
    document.getElementById('resultado');

  if (resultados.length === 0) {

    div.innerHTML = `
      <p>
        Nenhuma equivalência encontrada.<br>
        Verifique se o texto foi copiado corretamente do Paxtu.
      </p>
    `;

    document.getElementById('btnCopiar')
      .style.display = 'none';

    return;
  }

  let html = `
    <table id="tabelaResultado">

      <thead>

        <tr>

          <th>Código Antigo</th>

          <th>Item Antigo</th>

          <th>Item Novo</th>

          <th>Bloco Novo</th>

          <th>Data</th>

          <th>Palavra chave</th>

        </tr>

      </thead>

      <tbody>
  `;

  resultados.forEach(r => {

    html += `

      <tr>

        <td>${r.codigoAntigo}</td>

        <td>${r.itemAntigo}</td>

        <td>${r.itemNovo}</td>

        <td>${r.bloco}</td>

        <td>${r.data}</td>

        <td>${r.palavraChave}</td>

      </tr>

    `;

  });

  html += `

      </tbody>

    </table>
  `;

  div.innerHTML = html;

  div.scrollIntoView({
    behavior: 'smooth'
  });

  document.getElementById('btnCopiar')
    .style.display = 'inline-block';

  configurarCopia();

}

function configurarCopia() {

  const btn =
    document.getElementById('btnCopiar');

  btn.onclick = () => {

    const tabela =
      document.getElementById('tabelaResultado');

    let texto = '';

    for (const row of tabela.rows) {

      const cols =
        Array.from(row.cells)
          .map(cell => cell.innerText);

      texto += cols.join('\t') + '\n';

    }

    navigator.clipboard.writeText(texto);

    alert(
      'Tabela copiada! Agora você pode colar no Excel.'
    );

  };

}

