//演習1-0
const result = document.getElementById('result');

const practice0 = () => {
  const min = -3; //下限
  const max = 3;//上限
  const step = 1;//刻み幅
  for (let theta = min; theta <= max; theta += step) {
    result.innerHTML += theta + ',';//htmlにθを追記
  }
  result.innerHTML += '<br>';
}
//practice0();//practice0() 関数の実行

//確率密度
const norm = (theta) => {
  return Math.exp(-theta * theta / 2) / Math.sqrt(2 * Math.PI);
}

const normDist = (min, max, step) => {
  const dist = [];
  for (let theta = min; theta <= max; theta += step)
    dist.push(norm(theta) * step);
  return dist;
}
//演習1 - 1
const practice1 = () => {
  const dist = normDist(-3, 3, 1);
  for (let i = 0; i < dist.length; i++) {
    result.innerHTML += dist[i].toFixed(4) + '<br>';
  }
}
//practice1();

//演習1－2
const correctProbability = (theta, a, b) => {
  return 1 / (1 + Math.exp(-1.7 * a * (theta - b)));
}
const responseProbability = (x, theta, a, b) => {
  const p = correctProbability(theta, a, b);
  return Math.pow(p, x) * Math.pow(1 - p, 1 - x);
}
const icc = (x, a, b, min, max, step) => {
  const iccDist = [];
  for (let theta = min; theta <= max; theta += step) {
    iccDist.push(responseProbability(x, theta, a, b));
  }
  return iccDist;
}

const practice2 = () => {
  result.innerHTML += '反応確率=' +
    responseProbability(0, 1, 1, 2).toFixed(4);
  result.innerHTML += '<br>';
  result.innerHTML += '項目特性曲線=';
  icc(1, 1, 0, -3, 3, 1).forEach(value => {
    result.innerHTML += value.toFixed(4) + ',';
  });
  result.innerHTML += '<br>';
}
//practice2();


const itemBank = [
  { a: 1, b: 0 },
  { a: 0.5, b: 0.3 }
];
const bayes = (x, itemBank, min, max, step) => {
  const dist = normDist(min, max, step);//p(θ)
  x.forEach((eachX, index) => {
    const item = itemBank[index]; //$itemBankから一つの問題セットを取得
    const likelihoodDist = icc(eachX, item.a, item.b, min, max, step);
    dist.forEach((_, theta, arr) =>
      arr[theta] *= likelihoodDist[theta]);//p(θ)掛けるp(x|θ)
  });
  //周辺尤度の計算
  const marginalLikelihood = dist.reduce((a, b) => a + b);//P(x)
  dist.forEach((_, theta, arr) =>
    arr[theta] /= marginalLikelihood);//P(θ)掛けるP(X|θ)
  return dist;
}
//argmax関数
const argmax = arr => arr.indexOf(arr.reduce((a, b) => Math.max(a, b)));

const estimation = (x, itemBank, min, max, step) => {
  const probabiloty = bayes(x, itemBank, min, max, step);
  return min + argmax(probabiloty) * step;
}


const practice3 = () => {
  result.innerHTML += 'bayes_result= <br>';
  const dist = bayes([1], [{ a: 1, b: 0 }], -2, 2, 1);
  for (let i = 0; i < dist.length; i++) {
    result.innerHTML += dist[i].toFixed(4) + '<br>';
  }

  result.innerHTML += 'estimation_result=';

  result.innerHTML += estimation([1], [{ a: 1, b: 0 }], -2, 2, 1);
  result.innerHTML += '<br>';
}
//practice3();


/**
 * シミュレーション実験
 *
 * @param {number} Q_NUM 問題数
 * @param {number} E_NUM 受験者数
 * @return {number} 平均誤差
 */

//演習1-4
const information = (theta, itemBank) => {
  let info = 0;
  itemBank.forEach(item => {
    const p = correctProbability(theta, item.a, item.b);
    info += 1.7 * 1.7 * item.a * item.a * p * (1 - p);
  });
  return info;
}
const standardError = (theta, itemBank) => {
  return 1.0 / math.sqrt(information(theta, itemBank));
}

const Practice4 = () => {
  result.innerHTML += 'information(0,[{a:1,b:0}])=';
  result.innerHTML += information(0, [{ a: 1, b: 0 }]).toFixed(4) + '<br>';
}
//Practice4();
/*
const simulation = (Q_NUM, E_NUM) => {
  //アイテムバンク生成
  const itemBank = [];
  for (let i = 0; i < Q_NUM; i++) {
    itemBank.push({
      a: Math.random() * 2,
      b: (Math.random() - 0.5) * 6
    });
  }
  //受験者生成
  const examinee = [];
  for (let e = 0; e < E_NUM; e++) {
    examinee.push((Math.random() - 0.5) * 6);//[-3,3)
  }
  //受験者ごとの誤差
  const error = [];
  for (const theta of examinee) {
    const x = [];//正誤
    for (const item of itemBank) {
      x.push(correctProbability(theta, item.a, item.b) > Math.random() ? 1 : 0)
    };
    //問題ごとの誤差
    error.push(Math.abs(theta - estimation(x, itemBank, -3, 3, 0.1)));
  }
  //平均誤差
  return error.reduce((a, b) => a + b) / E_NUM;
}

result.innerHTML += '平均誤差' + simulation(30, 200).toFixed(5);

//kadai2
const weibull = (m, eta) => {
  return eta * Math.pow(-Math.log(1 - Math.random()), 1 / m);
}
*/

/*const simulation_2 = (Q_NUM, E_NUM) => {
  //アイテムバンク生成
  m = 3;
  eta = 3.0;
  const itemBank = [];
  for (let i = 0; i < Q_NUM; i++) { //一様分布からワイブル分布に変更
    itemBank.push({
      a: weibull(m, eta),
      b: (Math.random() - 0.5) * 6
    });
  }
  //受験者生成
  const examinee = [];
  for (let e = 0; e < E_NUM; e++) {
    examinee.push((Math.random() - 0.5) * 6);//[-3,3)
  }
  //受験者ごとの誤差
  const error = [];
  for (const theta of examinee) {
    const x = [];//正誤
    for (const item of itemBank) {
      x.push(correctProbability(theta, item.a, item.b) > Math.random() ? 1 : 0)
    };
    //問題ごとの誤差
    error.push(Math.abs(theta - estimation(x, itemBank, -3, 3, 0.1)));
  }
  //平均誤差
  return error.reduce((a, b) => a + b) / E_NUM;
}
for (i = 0; i < 5; i++) {
  result.innerHTML += '<br>'
  result.innerHTML += 'ワイブル分布を用いた平均誤差' + simulation_2(30, 200).toFixed(5);
}

*/