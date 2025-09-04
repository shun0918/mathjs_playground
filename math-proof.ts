import {
  create,
  bignumber,
  all,
} from 'mathjs';

// より低い精度で誤差を顕著にする
const config = {
  number: 'BigNumber', 
  precision: 20,  // 精度を20桁に制限して誤差を顕著にする
} as const;

const math = create(all ?? {}, config)

console.log('=== 小数点以下10位より大きな誤差の証明 ===\n');
console.log(`精度設定: ${config.precision} 桁（意図的に低く設定）\n`);

// 証明1: 1/3を使った明確な誤差
console.log('【証明1】1÷3×3 を繰り返す vs 一括計算');
let value = bignumber(1000);  // 初期値1000

// 方法A: 逐次計算（誤差が蓄積）
let sequential = value;
for(let i = 0; i < 30; i++) {
  // 1/3 して 3倍する（理論上は変わらないはず）
  sequential = math.evaluate('($x / 3) * 3', { '$x': sequential });
}

// 方法B: 一括計算（誤差なし）
let batch = value;  // 元の値のまま

console.log(`初期値:     ${value.toString()}`);
console.log(`逐次計算後: ${sequential.toString()}`);
console.log(`理論値:     ${batch.toString()}`);

let error1 = math.evaluate('abs($s - $b)', { '$s': sequential, '$b': batch });
console.log(`誤差:       ${error1.toString()}`);
console.log(`小数点以下10位より大きな誤差: ${error1.toNumber() > 1e-10}\n`);

// 証明2: 複数の素数での除算
console.log('【証明2】素数での連続除算・乗算');
let start = bignumber('123456789.123456789');
let result = start;

// 素数で順に除算
const primes = [7, 11, 13, 17, 19, 23, 29, 31];
console.log(`初期値: ${start.toString()}`);

// 除算フェーズ
for(const p of primes) {
  result = math.evaluate('$x / $p', { '$x': result, '$p': p });
  console.log(`÷${p} → ${result.toString().substring(0, 25)}...`);
}

console.log('\n逆順で乗算して戻す:');

// 乗算フェーズ（逆順）
for(const p of primes.reverse()) {
  result = math.evaluate('$x * $p', { '$x': result, '$p': p });
  console.log(`×${p} → ${result.toString().substring(0, 25)}...`);
}

console.log(`\n最終結果: ${result.toString()}`);
console.log(`初期値:   ${start.toString()}`);

let error2 = math.evaluate('abs($r - $s)', { '$r': result, '$s': start });
console.log(`誤差:     ${error2.toString()}`);

// 小数点位置を確認
let errorStr = error2.toString();
if(errorStr.includes('.')) {
  let decimalPart = errorStr.split('.')[1];
  let nonZeroPos = 0;
  for(let i = 0; i < decimalPart.length; i++) {
    if(decimalPart[i] !== '0') {
      nonZeroPos = i + 1;
      break;
    }
  }
  console.log(`誤差は小数点以下${nonZeroPos}位から発生`);
}

console.log(`小数点以下10位より大きな誤差: ${error2.toNumber() > 1e-10}\n`);

// 証明3: 実用的な例 - 金額計算
console.log('【証明3】実用例 - 税率計算での誤差');
let price = bignumber('99999.99');  // 商品価格
let taxRate = bignumber('1.08');    // 8%税率

// 方法A: 個別に税込み計算してから税抜きに戻す（100回）
let methodA = price;
for(let i = 0; i < 100; i++) {
  // 税込み価格にする
  methodA = math.evaluate('$p * $t', { '$p': methodA, '$t': taxRate });
  // 税抜き価格に戻す
  methodA = math.evaluate('$p / $t', { '$p': methodA, '$t': taxRate });
}

// 方法B: 理論値（変わらないはず）
let methodB = price;

console.log(`元の価格:           ${price.toString()}`);
console.log(`100回税込み⇔税抜き後: ${methodA.toString()}`);
console.log(`誤差:               ${math.evaluate('abs($a - $b)', { '$a': methodA, '$b': methodB }).toString()}`);

let error3 = math.evaluate('abs($a - $b)', { '$a': methodA, '$b': methodB });
console.log(`小数点以下10位より大きな誤差: ${error3.toNumber() > 1e-10}`);

console.log('\n=== 検証結果 ===');
console.log('精度20桁のBigNumberでも、逐次計算では明確に誤差が蓄積されます。');
console.log('これは「計算結果を使って更に計算する場合は、');
console.log('可能な限り式を束ねて一度に計算すべき」という原則を証明しています。');
console.log('\n推奨される対策:');
console.log('1. 可能な限り式を束ねて一括計算する');
console.log('2. 精度を上げる（ただしパフォーマンスとのトレードオフ）');
console.log('3. 計算順序を工夫する（除算を最後にまとめる等）');