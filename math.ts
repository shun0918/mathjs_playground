import {
  create,
  bignumber,
  all,
} from 'mathjs';

const config = {
  number: 'BigNumber',
  precision: 64,
} as const;

const math = create(all ?? {}, config)

console.log('=== BigNumber 精度制限による丸め誤差の証明 ===\n');
console.log(`精度設定: ${config.precision} 桁\n`);

// テスト1: 少ない回数での誤差確認
console.log('【テスト1】10回の除算と乗算での誤差');
let iterations = 10;
let divisor = 3;
let original = bignumber(1);
let x = original;

// 除算を繰り返す
for(let i = 0; i < iterations; i++) {
  x = math.evaluate('$x / $d', { '$x': x, '$d': divisor });
}
console.log(`1 を ${divisor} で ${iterations} 回除算: ${x.toString()}`);

// 乗算を繰り返す
for(let i = 0; i < iterations; i++) {
  x = math.evaluate('$x * $d', { '$x': x, '$d': divisor });
}
console.log(`その後 ${divisor} を ${iterations} 回乗算: ${x.toString()}`);

// 誤差を計算
let error = math.evaluate('abs($final - $original)', { 
  '$final': x, 
  '$original': original 
});
console.log(`元の値との差: ${error.toString()}`);
console.log(`誤差あり: ${!x.equals(original)}\n`);

// テスト2: 異なる除数での検証
console.log('【テスト2】様々な除数での100回演算');
const divisors = [3, 7, 11, 13];
iterations = 100;

for(const div of divisors) {
  let y = bignumber(1);
  
  // 除算
  for(let i = 0; i < iterations; i++) {
    y = math.evaluate('$y / $d', { '$y': y, '$d': div });
  }
  
  // 乗算で戻す
  for(let i = 0; i < iterations; i++) {
    y = math.evaluate('$y * $d', { '$y': y, '$d': div });
  }
  
  let err = math.evaluate('abs($y - 1)', { '$y': y });
  console.log(`除数 ${div}: 最終値=${y.toString().substring(0, 20)}... 誤差=${err.toString()}`);
}

// テスト3: 一括計算との比較
console.log('\n【テスト3】逐次計算 vs 一括計算');
iterations = 50;
divisor = 7;

// 逐次計算
let sequential = bignumber(10);
for(let i = 0; i < iterations; i++) {
  sequential = math.evaluate('$x / $d', { '$x': sequential, '$d': divisor });
}

// 一括計算（7^50で一度に除算）
let batch = math.evaluate('10 / ($d ^ $n)', { 
  '$d': bignumber(divisor), 
  '$n': bignumber(iterations) 
});

console.log(`逐次計算 (10を7で50回除算): ${sequential.toString()}`);
console.log(`一括計算 (10÷7^50):         ${batch.toString()}`);

let diff = math.evaluate('abs($s - $b)', { '$s': sequential, '$b': batch });
console.log(`差: ${diff.toString()}`);
console.log(`同じ結果: ${sequential.equals(batch)}`);

// テスト4: 複合演算での誤差蓄積
console.log('\n【テスト4】複合演算での誤差蓄積');
let z = bignumber(1);
const operations = [
  { op: '/', value: 3 },
  { op: '*', value: 5 },
  { op: '/', value: 7 },
  { op: '*', value: 11 },
  { op: '/', value: 13 },
];

// 50サイクル実行
for(let cycle = 0; cycle < 50; cycle++) {
  for(const {op, value} of operations) {
    if(op === '/') {
      z = math.evaluate('$z / $v', { '$z': z, '$v': value });
    } else {
      z = math.evaluate('$z * $v', { '$z': z, '$v': value });
    }
  }
}

// 理論上は (5*11)/(3*7*13) = 55/273 を50回適用
let theoretical = math.evaluate('1 * ((55/273) ^ 50)');
console.log(`逐次計算結果: ${z.toString()}`);
console.log(`理論値:       ${theoretical.toString()}`);

let finalError = math.evaluate('abs($z - $t)', { '$z': z, '$t': theoretical });
console.log(`誤差: ${finalError.toString()}`);

console.log('\n=== 結論 ===');
console.log('BigNumberでも精度制限により、逐次計算では丸め誤差が蓄積されます。');
console.log('特に循環小数を含む演算を繰り返すと、誤差が顕著に現れます。');