export function sum_to_n_a(n: number): number {
  // Time: O(n)
  // Space: O(1)
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }

  return sum;
}

export function sum_to_n_b(n: number): number {
  // Time: O(n)
  // Space: O(n)
  // Trade off: can be out of stack with large n
  if (n === 0) {
    return 0;
  }

  return n + sum_to_n_b(n - 1);
}

export function sum_to_n_c(n: number): number {
  // Time: O(1)
  // Space: O(1)
  // S = 1 + 2 + 3 + ... + (n-1) + n
  // S = n + (n-1) + (n-2) + ... + 2 + 1
  // 2S = (n+1) + (n+1) + (n+1) + ... + (n+1) + (n+1)
  // 2S = n*(n+1)
  // S = n*(n+1)/2

  // ex: n = 10
  // S = 1 + 2 + 3 + ... + 10
  // S = 10 + 9 + 8 + ... + 1
  // 2S = (10+1) + (9+2) + (8+3) + ... + (1+10)
  // S = 10*(10+1)/2 = 55
  return (n * (n + 1)) / 2;
}
