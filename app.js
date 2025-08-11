// ===== Utilidades =====
const toNum = (v) => {
    const s = String(v ?? '').trim().replace(',', '.');
    if (!s) return NaN;
    const x = Number(s);
    return Number.isFinite(x) ? x : NaN;
  };
  
  const fmt = (x) => {
    if (!Number.isFinite(x)) return '—';
    const a = Math.abs(x);
    if (a === 0) return '0';
    if (a < 1e-3 || a >= 1e6) return x.toExponential(6);
    return x.toFixed(8).replace(/0+$/,'').replace(/\.$/,'');
  };

  function f(coeffs, x){
    let y = 0; for (const a of coeffs) y = y * x + a; return y;
  }
  
  function bolzano(coeffs, A, B, M){
    const dx = (B - A) / M;
    const out = []; // cada item: {i, x0, x1, f0, f1, tipo}
    let x0 = A, f0 = f(coeffs, x0);
    if (!Number.isFinite(f0)) throw new Error('Avaliação numérica falhou em A.');
    for (let i = 1; i <= M; i++){
      const x1 = (i === M) ? B : A + i*dx;
      const f1 = f(coeffs, x1);
      if (!Number.isFinite(f1)) throw new Error('Avaliação numérica falhou em algum ponto.');
  
      if (f1 === 0){
        out.push({ i, x0: x1, x1: x1, f0: f1, f1: f1, tipo: 'raiz exata' });
      } else if (f0 === 0){
        out.push({ i, x0: x0, x1: x0, f0: f0, f1: f0, tipo: 'raiz exata' });
      } else if (f0 * f1 < 0){
        out.push({ i, x0, x1, f0, f1, tipo: 'troca de sinal' });
      }
  
      x0 = x1; f0 = f1;
    }
    return out;
  }
  
  // Bissecção em um intervalo [a,b]
  function bisseccao(coeffs, a, b, tol=1e-6, maxIter=100){
    let fa = f(coeffs, a), fb = f(coeffs, b);
    if (fa === 0) return {root:a, froot:0, iters:0};
    if (fb === 0) return {root:b, froot:0, iters:0};
    if (fa*fb > 0) throw new Error('Sem troca de sinal em ['+a+','+b+']');
  
    let m=a, fm=fa, k=0;
    while (k < maxIter){
      m = (a+b)/2; fm = f(coeffs, m);
      const err = Math.abs(b-a)/2;
      if (Math.abs(fm) <= tol || err <= tol) break;
      if (fa*fm < 0){ b=m; fb=fm; } else { a=m; fa=fm; }
      k++;
    }
    return {root:m, froot:fm, iters:k+1};
  }
  
  // ===== UI =====
  