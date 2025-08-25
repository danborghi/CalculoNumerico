(function(){
    // Utilidades
    const $$ = (sel, root=document) => root.querySelector(sel);
    const $$$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  
    const decs = () => {
      const d = parseInt($$('#decimais').value, 10);
      return Number.isFinite(d) && d >= 0 ? Math.min(d, 12) : 6;
    };
  
    const fmt = (v) => {
      if (!Number.isFinite(v)) return String(v);
      const d = decs();
      // Evita -0.000000
      const val = Math.abs(v) < Math.pow(10, -d) ? 0 : v;
      return val.toFixed(d);
    };
  
    // Criação de inputs para A (n x n) e b (n)
    function criarInputs(n){
      // Matriz A
      const Ael = $$('#matriz-a');
      Ael.innerHTML = '';
      const t = document.createElement('table');
      t.className = 'table';
      for(let i=0; i<n; i++){
        const tr = document.createElement('tr');
        for(let j=0; j<n; j++){
          const td = document.createElement('td');
          const inp = document.createElement('input');
          inp.type = 'number'; inp.step = 'any';
          inp.placeholder = '0';
          inp.id = `A_${i}_${j}`;
          td.appendChild(inp);
          tr.appendChild(td);
        }
        t.appendChild(tr);
      }
      Ael.appendChild(t);
  
      // Vetor b
      const Bel = $$('#vetor-b');
      Bel.innerHTML = '';
      const tb = document.createElement('table');
      tb.className = 'table';
      for(let i=0; i<n; i++){
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        const inp = document.createElement('input');
        inp.type = 'number'; inp.step = 'any';
        inp.placeholder = '0';
        inp.id = `b_${i}`;
        td.appendChild(inp);
        tr.appendChild(td);
        tb.appendChild(tr);
      }
      Bel.appendChild(tb);
    }
  
    function lerMatriz(n){
      const A = Array.from({length:n}, () => Array(n).fill(0));
      for(let i=0; i<n; i++){
        for(let j=0; j<n; j++){
          const v = parseFloat($$(`#A_${i}_${j}`).value);
          A[i][j] = Number.isFinite(v) ? v : 0;
        }
      }
      return A;
    }
  
    function lerVetor(n){
      const b = Array(n).fill(0);
      for(let i=0; i<n; i++){
        const v = parseFloat($$(`#b_${i}`).value);
        b[i] = Number.isFinite(v) ? v : 0;
      }
      return b;
    }
  
    function clonarMatriz(A){
      return A.map(row => row.slice());
    }
  
    function trocarLinhas(A, i, j){
      if(i === j) return;
      const tmp = A[i]; A[i] = A[j]; A[j] = tmp;
    }
    function trocar(b, i, j){
      if(i === j) return;
      const tmp = b[i]; b[i] = b[j]; b[j] = tmp;
    }
  
    function renderTabelaMatriz(containerSel, M, headerPrefix=''){
      const cont = $$(containerSel);
      cont.innerHTML = '';
      const t = document.createElement('table');
      t.className = 'table';
      const thead = document.createElement('thead');
      const trh = document.createElement('tr');
      const th0 = document.createElement('th'); th0.textContent = headerPrefix || 'i\\j';
      trh.appendChild(th0);
      for(let j=0; j<M[0].length; j++){
        const th = document.createElement('th');
        th.textContent = j;
        trh.appendChild(th);
      }
      thead.appendChild(trh);
      t.appendChild(thead);
  
      const tbody = document.createElement('tbody');
      for(let i=0; i<M.length; i++){
        const tr = document.createElement('tr');
        const th = document.createElement('th'); th.textContent = i; tr.appendChild(th);
        for(let j=0; j<M[i].length; j++){
          const td = document.createElement('td'); td.textContent = fmt(M[i][j]);
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
      t.appendChild(tbody);
      cont.appendChild(t);
    }
  
    function renderTabelaVetor(containerSel, v, label='i'){
      const cont = $$(containerSel);
      cont.innerHTML = '';
      const t = document.createElement('table');
      t.className = 'table';
  
      const thead = document.createElement('thead');
      const trh = document.createElement('tr');
      const th0 = document.createElement('th'); th0.textContent = label;
      const th1 = document.createElement('th'); th1.textContent = 'valor';
      trh.appendChild(th0); trh.appendChild(th1);
      thead.appendChild(trh);
      t.appendChild(thead);
  
      const tbody = document.createElement('tbody');
      for(let i=0; i<v.length; i++){
        const tr = document.createElement('tr');
        const th = document.createElement('th'); th.textContent = i;
        const td = document.createElement('td'); td.textContent = fmt(v[i]);
        tr.appendChild(th); tr.appendChild(td);
        tbody.appendChild(tr);
      }
      t.appendChild(tbody);
      cont.appendChild(t);
    }
  
    /**
     * Eliminação de Gauss com pivotamento parcial opcional.
     * Retorna { U, bp, x, log }
     */
    function eliminacaoDeGauss(Ain, bin, usarPivot){
      const n = Ain.length;
      const A = clonarMatriz(Ain);
      const b = bin.slice();
      const log = [];
  
      const eps = 1e-15;
  
      for(let k=0; k<n-1; k++){
        // Pivotamento parcial
        if(usarPivot){
          let p = k;
          let max = Math.abs(A[k][k]);
          for(let i=k+1; i<n; i++){
            const v = Math.abs(A[i][k]);
            if(v > max){ max = v; p = i; }
          }
          if(p !== k){
            trocarLinhas(A, k, p);
            trocar(b, k, p);
            log.push(`k=${k}: Pivotamento — trocou R${k} ↔ R${p}`);
          }
        }
  
        // Verificação de pivô
        if (Math.abs(A[k][k]) < eps) {
          throw new Error(`Pivô zero/numérico em k=${k}. Ative o pivotamento ou ajuste o sistema.`);
        }
  
        // Eliminação
        for(let i=k+1; i<n; i++){
          const m = A[i][k] / A[k][k];
          if (Math.abs(m) > eps){
            for(let j=k; j<n; j++){
              A[i][j] -= m * A[k][j];
            }
            b[i] -= m * b[k];
            log.push(`k=${k}: R${i} ← R${i} − (${fmt(m)})·R${k}`);
          } else {
            // Sem operação relevante
          }
        }
      }
  
      // Substituição retroativa
      const x = Array(n).fill(0);
      for(let i=n-1; i>=0; i--){
        let soma = 0;
        for(let j=i+1; j<n; j++){
          soma += A[i][j] * x[j];
        }
        if (Math.abs(A[i][i]) < eps) {
          throw new Error(`Pivô zero/numérico em i=${i} durante a retro-substituição.`);
        }
        x[i] = (b[i] - soma) / A[i][i];
      }
  
      return { U: A, bp: b, x, log };
    }
  
    // Ações
    function onGerar(){
      const n = parseInt($$('#dim-n').value, 10);
      const nVal = Number.isFinite(n) ? Math.max(2, Math.min(n, 10)) : 3;
      $$('#dim-n').value = String(nVal);
      criarInputs(nVal);
    }
  
    function onLimpar(){
      $$$('#matriz-a input').forEach(i => i.value = '');
      $$$('#vetor-b input').forEach(i => i.value = '');
      $$('#log-passos').textContent = '';
      $$('#saida-u').innerHTML = '';
      $$('#saida-bp').innerHTML = '';
      $$('#saida-x').innerHTML = '';
    }
  
    function onResolver(){
      try{
        const n = parseInt($$('#dim-n').value, 10);
        const usarPivot = !!$$('#chk-pivot').checked;
        const A = lerMatriz(n);
        const b = lerVetor(n);
  
        const { U, bp, x, log } = eliminacaoDeGauss(A, b, usarPivot);
  
        $$('#log-passos').textContent = log.join('\n');
        renderTabelaMatriz('#saida-u', U, 'U');
        renderTabelaVetor('#saida-bp', bp, 'i');
  
        // Render solução
        const cont = $$('#saida-x');
        cont.innerHTML = '';
        const t = document.createElement('table');
        t.className = 'table';
        const thead = document.createElement('thead');
        const trh = document.createElement('tr');
        const th0 = document.createElement('th'); th0.textContent = 'variável';
        const th1 = document.createElement('th'); th1.textContent = 'valor';
        trh.appendChild(th0); trh.appendChild(th1);
        thead.appendChild(trh); t.appendChild(thead);
        const tbody = document.createElement('tbody');
        for(let i=0;i<x.length;i++){
          const tr = document.createElement('tr');
          const th = document.createElement('th'); th.textContent = `x${i}`;
          const td = document.createElement('td'); td.textContent = fmt(x[i]);
          tr.appendChild(th); tr.appendChild(td);
          tbody.appendChild(tr);
        }
        t.appendChild(tbody);
        cont.appendChild(t);
  
      }catch(err){
        $$('#log-passos').textContent = `Erro: ${(err && err.message) ? err.message : err}`;
        $$('#saida-u').innerHTML = '';
        $$('#saida-bp').innerHTML = '';
        $$('#saida-x').innerHTML = '';
      }
    }
  
    // Inicialização
    document.addEventListener('DOMContentLoaded', () => {
      $$('#btn-gerar').addEventListener('click', onGerar);
      $$('#btn-limpar').addEventListener('click', onLimpar);
      $$('#btn-resolver').addEventListener('click', onResolver);
  
      // Cria uma matriz inicial 3x3 vazia
      criarInputs(3);
    });
  })();
  