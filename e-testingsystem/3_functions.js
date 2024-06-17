const getItem = async (i) => {
  const response = await fetch('2_ItemBank.json?v=' + Date.now());
  const data = await response.json();
  return data[i];
}
//getItem(0).then(item => console.log(item));

//テーブルの作成
const table = document.createElement('table');


const exam = {};

const startTesting = async () => {
  exam.n = 0;
  exam.x = [];
  exam.theta = 0;
  //解答履歴を保存する
  exam.ans = [];
  exam.results = [];
  exam.confidence = [];
  exam.bank = []; //項目履歴/*追加*/
  createExam(await getItem(0));
}



//フォームが送信されたとき（解答ボタンが押されたとき）の処理
document.getElementById('exam-box').onsubmit = (e) => {
  e.preventDefault();
  continueTesting();
}

const continueTesting = async () => {
  //選択されているラジオボタン情報を取得
  const choice = parseInt(document.getElementById('exam-box').choices.value);
  //現在の問題項目を取得
  let item = await getItem(exam.n);

  //自信度の処理
  if (item.isconfidence) {
    exam.confidence += item.choices[choice];

  } else {
    //正答なら1,誤答なら０を記録
    const correct = choice === item.correct ? 1 : 0;
    exam.x.push(correct);
    exam.bank.push(item);
    //解答履歴記録
    exam.ans.push(choice);
    // 解答結果を保存
    exam.results.push({
      questionNumber: exam.n + 1,
      answer: item.choices[choice],
      correctness: correct ? '○' : 'x',
      isconfidence: false
    });
    //能力値（正答率）を計算  /*追加（変更）*/

    //exam.x.reduce((a, b) => a + b) / exam.x.length;
    exam.theta = estimation(exam.x, exam.bank, -3, 3, 0.1);
    exam.theta_2 = exam.x.reduce((a, b) => a + b) / exam.x.length;
  }
  //解答数を繰り上げ
  exam.n++;
  //次の問題項目を取得
  item = await getItem(exam.n);
  //次の問題があれば出力,なければテスト終了
  if (typeof item !== 'undefined')
    createExam(item);
  else
    finishTesting();

};

const createExam = (item) => {
  //問題領域
  const questionArea = document.getElementById('question-area');
  if (item.isconfidence) {
    questionArea.innerHTML = item.question;
  } else {
    questionArea.innerHTML = '第' + (exam.n - 1) + '問<br>' + item.question;//何問目か表示(exam.n+1が本来するべきだが,自信度を問う問題が2問ある為、-1にしている)
  }
  //選択肢領域
  const choices = item.choices;
  const choiceArea = document.getElementById('choice-area');
  choiceArea.classList.add("m-3");//見た目追加
  choiceArea.innerHTML = '';
  choices.forEach((eachChoice, index) => {
    //ラジオボタン
    const input = document.createElement('input');
    input.id = 'choice' + index;//ID追加
    input.type = 'radio';
    input.name = 'choices';
    input.value = index;
    input.style.cursor = 'pointer';//追加
    input.classList.add("form-check-input");//追加
    input.required = true;//追加
    //選択肢ラベル
    const label = document.createElement('label');
    label.setAttribute('for', 'choice' + index);//forとchoiceの紐づけ
    label.innerHTML = eachChoice;
    label.style.cursor = 'pointer';//ポインター追加
    label.classList.add("form-check-label");//bootstrap追加
    //選択肢領域への追加
    const div = document.createElement('div');
    div.appendChild(input);
    div.appendChild(label);
    div.classList.add("form-check");//追加
    choiceArea.appendChild(div);
  });
}

const finishTesting = () => {
  const result = '<h1>試験は終了です。</h1><br>あなたの能力値は' + exam.theta + 'です。' + '<br><br>正答率は' + exam.theta_2 + 'です<br>自信度 :英語:' + exam.confidence[0] + '世界史:' + exam.confidence[1] + '全体:' + exam.confidence[2];

  const examBox = document.getElementById('exam-box');
  examBox.innerHTML = result;
  for (let record of exam.results) {
    if (!record.isconfidence) { //isconfidenceがtrueなら表に出力できないようにしている
      addResultToTable(record.questionNumber, record.answer, record.correctness);
    }
  }
  examBox.appendChild(table);
  //テーブルヘッダの作成
  const tr = table.createTHead().insertRow();
  const headers = ['問', 'あなたの解答', '正誤'];
  headers.forEach((header) => {
    const th = document.createElement('th');
    th.textContent = header;
    tr.appendChild(th);
  });
};

//テーブルの各行にテストの結果を追加
const addResultToTable = (questionNumber, answer, correctness) => {
  //for (let i = 0; i < exam.n; i++) {
  const row = table.insertRow();
  const records = [questionNumber - 2, answer, correctness]//冒頭2問自信度を取っているので問題番号-2している
  records.forEach((data) => {
    const td = document.createElement('td');
    td.textContent = data;
    if (correctness == 'x') {
      td.classList.add('wrong')
    }
    row.appendChild(td);
  });
}


document.getElementById('exam-box').appendChild(table);
startTesting();