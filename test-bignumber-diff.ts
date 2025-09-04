import {
  create,
  bignumber,
  all,
} from 'mathjs';

console.log('=== bignumber関数 vs math.bignumberメソッドの違い ===\n');

// 異なる精度でmathインスタンスを作成
const math10 = create(all ?? {}, {
  number: 'BigNumber',
  precision: 10
});

const math64 = create(all ?? {}, {
  number: 'BigNumber',
  precision: 64
});

// テスト1: 基本的な作成
console.log('【テスト1】基本的なBigNumber作成');
const direct = bignumber('123.456789123456789');
const via10 = math10.bignumber('123.456789123456789');
const via64 = math64.bignumber('123.456789123456789');

console.log(`直接import:     ${direct.toString()}`);
console.log(`math10経由:     ${via10.toString()}`);
console.log(`math64経由:     ${via64.toString()}`);
console.log(`全て同じ値か:   ${direct.equals(via10) && via10.equals(via64)}\n`);

// テスト2: 精度の影響を受ける計算
console.log('【テスト2】1÷3の計算');
const directDiv = bignumber(1).div(bignumber(3));
const via10Div = math10.divide(math10.bignumber(1), math10.bignumber(3));
const via64Div = math64.divide(math64.bignumber(1), math64.bignumber(3));

console.log(`直接.div():     ${directDiv.toString()}`);
console.log(`math10.divide: ${via10Div.toString()}`);
console.log(`math64.divide: ${via64Div.toString()}\n`);

// テスト3: 精度設定の確認
console.log('【テスト3】精度設定の確認');
// 精度設定はcreate時のconfigで決まる
console.log(`math10の精度設定: 10`);
console.log(`math64の精度設定: 64`);
console.log(`直接importしたbignumberの精度: デフォルト(64桁)\n`);

// テスト4: BigNumberインスタンスの互換性
console.log('【テスト4】異なる方法で作成したBigNumberの演算');
try {
  // 直接importしたbignumber関数で作成
  const a = bignumber(10);
  // math経由で作成
  const b = math10.bignumber(5);
  
  // math10で計算
  const result1 = math10.add(a, b);
  console.log(`math10.add(直接, math10経由) = ${result1.toString()}`);
  
  // math64で計算
  const result2 = math64.add(a, b);
  console.log(`math64.add(直接, math10経由) = ${result2.toString()}`);
  
  // 直接メソッドで計算
  const result3 = a.add(b);
  console.log(`直接.add()                   = ${result3.toString()}\n`);
} catch(e) {
  console.log(`エラー: ${e}\n`);
}

// テスト5: 長い小数での精度の違い
console.log('【テスト5】長い小数での精度の違い');
const longDecimal = '0.123456789123456789123456789123456789';

const directLong = bignumber(longDecimal);
const via10Long = math10.bignumber(longDecimal);
const via64Long = math64.bignumber(longDecimal);

console.log(`元の値:         ${longDecimal}`);
console.log(`直接import:     ${directLong.toString()}`);
console.log(`math10経由:     ${via10Long.toString()}`);
console.log(`math64経由:     ${via64Long.toString()}\n`);

// テスト6: 計算結果の精度
console.log('【テスト6】π÷7の計算精度');
const pi = '3.14159265358979323846264338327950288419716939937510';

const directPi = bignumber(pi).div(bignumber(7));
const via10Pi = math10.divide(math10.bignumber(pi), 7);
const via64Pi = math64.divide(math64.bignumber(pi), 7);

console.log(`直接.div():    ${directPi.toString()}`);
console.log(`math10.divide: ${via10Pi.toString()}`);
console.log(`math64.divide: ${via64Pi.toString()}\n`);

console.log('=== 結論 ===');
console.log('1. bignumber関数は直接importとmath経由で作成時の値は同じ');
console.log('2. ただし、計算時の精度はmathインスタンスの設定に依存');
console.log('3. 直接importしたbignumberのメソッド(.add, .div等)はデフォルト精度');
console.log('4. math.divide等の演算は、そのmathインスタンスの精度設定を使用');