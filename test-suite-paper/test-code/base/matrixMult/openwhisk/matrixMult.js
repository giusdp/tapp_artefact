function matrixMult(params) {
  const A = params.A;
  const B = params.B;
  const A_rows = A.length;
  const A_columns = A[0].length;
  const B_rows = B.length;
  const B_columns = B[0].length;

  let c = new Array(A_rows);

  for (let i = 0; i < A_rows; i++) {
    c[i] = new Array(B_columns);
    for (let j = 0; j < B_columns; j++) {
      c[i][j] = 0;
      for (let k = 0; k < A_columns; k++) {
        c[i][j] += (A[i][k] * B[k][j]);
      }
    }
  }

  return {
    "payload": c
  };
}

exports.main = matrixMult
