export interface Hanzi {
  id: string;
  hanzi: string;
  pinyin: string;
  tone: 1 | 2 | 3 | 4;
  translation: string;
  hskLevel: 1 | 2;
  category: string;
  imageUrl: string;
  examples: {
    chinese: string;
    pinyin: string;
    translation: string;
  }[];
}

export const hanziData: Hanzi[] = [
  {
    id: 'h01',
    hanzi: '你好',
    pinyin: 'nǐ hǎo',
    tone: 3,
    translation: 'Здравствуйте / Привет',
    hskLevel: 1,
    category: 'Приветствия',
    imageUrl: 'https://images.pexels.com/photos/1036641/pexels-photo-1036641.jpeg?auto=compress&cs=tinysrgb&w=600',
    examples: [
      { chinese: '你好吗？', pinyin: 'Nǐ hǎo ma?', translation: 'Как дела? (Как вы?)' },
      { chinese: '你好，我是学生。', pinyin: 'Nǐ hǎo, wǒ shì xuéshēng.', translation: 'Привет, я студент.' },
    ],
  },
  {
    id: 'h02',
    hanzi: '谢谢',
    pinyin: 'xièxie',
    tone: 4,
    translation: 'Спасибо',
    hskLevel: 1,
    category: 'Приветствия',
    imageUrl: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=600',
    examples: [
      { chinese: '非常谢谢！', pinyin: 'Fēicháng xièxie!', translation: 'Большое спасибо!' },
      { chinese: '谢谢你的帮助。', pinyin: 'Xièxie nǐ de bāngzhù.', translation: 'Спасибо за твою помощь.' },
    ],
  },
  {
    id: 'h03',
    hanzi: '中国',
    pinyin: 'Zhōngguó',
    tone: 1,
    translation: 'Китай',
    hskLevel: 1,
    category: 'География',
    imageUrl: 'https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=600',
    examples: [
      { chinese: '我去中国。', pinyin: 'Wǒ qù Zhōngguó.', translation: 'Я еду в Китай.' },
      { chinese: '中国很大。', pinyin: 'Zhōngguó hěn dà.', translation: 'Китай очень большой.' },
    ],
  },
  {
    id: 'h04',
    hanzi: '学',
    pinyin: 'xué',
    tone: 2,
    translation: 'Учить, изучать',
    hskLevel: 1,
    category: 'Действия',
    imageUrl: 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=600',
    examples: [
      { chinese: '我学汉语。', pinyin: 'Wǒ xué Hànyǔ.', translation: 'Я изучаю китайский язык.' },
      { chinese: '他学中文。', pinyin: 'Tā xué Zhōngwén.', translation: 'Он изучает китайский.' },
    ],
  },
  {
    id: 'h05',
    hanzi: '爱',
    pinyin: 'ài',
    tone: 4,
    translation: 'Любить',
    hskLevel: 1,
    category: 'Чувства',
    imageUrl: 'https://images.pexels.com/photos-1382891/pexels-photo-1382891.jpeg?auto=compress&cs=tinysrgb&w=600',
    examples: [
      { chinese: '我爱你。', pinyin: 'Wǒ ài nǐ.', translation: 'Я тебя люблю.' },
      { chinese: '我爱中国菜。', pinyin: 'Wǒ ài Zhōngguó cài.', translation: 'Я люблю китайскую еду.' },
    ],
  },
  {
    id: 'h06',
    hanzi: '茶',
    pinyin: 'chá',
    tone: 2,
    translation: 'Чай',
    hskLevel: 1,
    category: 'Еда и напитки',
    imageUrl: 'https://images.pexels.com/photos-230477/pexels-photo-230477.jpeg?auto=compress&cs=tinysrgb&w=600',
    examples: [
      { chinese: '我喝茶。', pinyin: 'Wǒ hē chá.', translation: 'Я пью чай.' },
      { chinese: '中国茶很有名。', pinyin: 'Zhōngguó chá hěn yǒumíng.', translation: 'Китайский чай очень знаменит.' },
    ],
  },
  {
    id: 'h07',
    hanzi: '人',
    pinyin: 'rén',
    tone: 2,
    translation: 'Человек, люди',
    hskLevel: 1,
    category: 'Существительные',
    imageUrl: 'https://images.pexels.com/photos-1036641/pexels-photo-1036641.jpeg?auto=compress&cs=tinysrgb&w=600',
    examples: [
      { chinese: '中国人很多。', pinyin: 'Zhōngguó rén hěn duō.', translation: 'Китайцев очень много.' },
      { chinese: '他是好人。', pinyin: 'Tā shì hǎo rén.', translation: 'Он хороший человек.' },
    ],
  },
  {
    id: 'h08',
    hanzi: '家',
    pinyin: 'jiā',
    tone: 1,
    translation: 'Дом, семья',
    hskLevel: 1,
    category: 'Существительные',
    imageUrl: 'https://images.pexels.com/photos-1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600',
    examples: [
      { chinese: '我回家。', pinyin: 'Wǒ huí jiā.', translation: 'Я возвращаюсь домой.' },
      { chinese: '我家很大。', pinyin: 'Wǒ jiā hěn dà.', translation: 'Мой дом большой.' },
    ],
  },
  // HSK 2
  {
    id: 'h09',
    hanzi: '觉得',
    pinyin: 'juéde',
    tone: 2,
    translation: 'Считать, полагать',
    hskLevel: 2,
    category: 'Действия',
    imageUrl: 'https://images.pexels.com/photos-2681319/pexels-photo-2681319.jpeg?auto=compress&cs=tinysrgb&w=600',
    examples: [
      { chinese: '我觉得很好。', pinyin: 'Wǒ juéde hěn hǎo.', translation: 'Я считаю, что это хорошо.' },
      { chinese: '你觉得怎么样？', pinyin: 'Nǐ juéde zěnmeyàng?', translation: 'Как ты считаешь?' },
    ],
  },
  {
    id: 'h10',
    hanzi: '准备',
    pinyin: 'zhǔnbèi',
    tone: 3,
    translation: 'Готовить, готовиться',
    hskLevel: 2,
    category: 'Действия',
    imageUrl: 'https://images.pexels.com/photos-356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=600',
    examples: [
      { chinese: '我准备考试。', pinyin: 'Wǒ zhǔnbèi kǎoshì.', translation: 'Я готовлюсь к экзамену.' },
      { chinese: '她准备晚饭。', pinyin: 'Tā zhǔnbèi wǎnfàn.', translation: 'Она готовит ужин.' },
    ],
  },
  {
    id: 'h11',
    hanzi: '感兴趣',
    pinyin: 'gǎn xìngqù',
    tone: 3,
    translation: 'Интересоваться',
    hskLevel: 2,
    category: 'Чувства',
    imageUrl: 'https://images.pexels.com/photos-256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=600',
    examples: [
      { chinese: '我对中国文化感兴趣。', pinyin: 'Wǒ duì Zhōngguó wénhuà gǎn xìngqù.', translation: 'Я интересуюсь китайской культурой.' },
      { chinese: '你对什么感兴趣？', pinyin: 'Nǐ duì shénme gǎn xìngqù?', translation: 'Чем ты интересуешься?' },
    ],
  },
  {
    id: 'h12',
    hanzi: '旅行',
    pinyin: 'lǚxíng',
    tone: 3,
    translation: 'Путешествовать',
    hskLevel: 2,
    category: 'Действия',
    imageUrl: 'https://images.pexels.com/photos-2086361/pexels-photo-2086361.jpeg?auto=compress&cs=tinysrgb&w=600',
    examples: [
      { chinese: '我去旅行。', pinyin: 'Wǒ qù lǚxíng.', translation: 'Я отправляюсь в путешествие.' },
      { chinese: '旅行很有意思。', pinyin: 'Lǚxíng hěn yǒu yìsi.', translation: 'Путешествовать очень интересно.' },
    ],
  },
];

export interface DailyFact {
  date: string;
  fact: string;
}

export const dailyFacts: DailyFact[] = [
  { date: '0', fact: 'Великая Китайская стена имеет общую длину более 21 000 километров — это самое длинное сооружение, построенное человеком.' },
  { date: '1', fact: 'Китайская письменность насчитывает более 50 000 иероглифов, но для чтения газеты достаточно знать около 3 000.' },
  { date: '2', fact: 'Чай был открыт в Китае более 5 000 лет назад. Легенда гласит, что император Шэньнун случайно обнаружил его, когда листья упали в его кипящую воду.' },
  { date: '3', fact: 'В китайском языке 4 тона. Слово «ma» может означать «мама», «коноплю», «лошадь» или «ругать» — в зависимости от тона.' },
  { date: '4', fact: 'Запретный город в Пекине имеет 9 999,5 комнат — число, символизирующее небесное величие императора.' },
  { date: '5', fact: 'Терракотовая армия в Сиане состоит из более чем 8 000 воинов, каждый из которых имеет уникальное лицо.' },
  { date: '6', fact: 'Китайский Новый год отмечается вторым новолунием после зимнего солнцестояния и длится 15 дней.' },
];

export interface ToneInfo {
  tone: number;
  name: string;
  description: string;
  pitch: string;
  example: string;
  examplePinyin: string;
  exampleTranslation: string;
  color: string;
}

export const tonesData: ToneInfo[] = [
  {
    tone: 1,
    name: 'Первый тон — ровный',
    description: 'Высокий ровный тон. Голос держится на высокой ноте без изменений, как натянутая струна.',
    pitch: '─────',
    example: '妈',
    examplePinyin: 'mā',
    exampleTranslation: 'мама',
    color: 'bg-crimson-600',
  },
  {
    tone: 2,
    name: 'Второй тон — восходящий',
    description: 'Тон повышается, как будто вы задаёте вопрос. Голос идёт снизу вверх.',
    pitch: '  ╱  ',
    example: '麻',
    examplePinyin: 'má',
    exampleTranslation: 'конопля',
    color: 'bg-gold-500',
  },
  {
    tone: 3,
    name: 'Третий тон — нисходяще-восходящий',
    description: 'Голос сначала опускается, а затем поднимается. Похож на волнообразное движение.',
    pitch: ' ╲╱  ',
    example: '马',
    examplePinyin: 'mǎ',
    exampleTranslation: 'лошадь',
    color: 'bg-ink-700',
  },
  {
    tone: 4,
    name: 'Четвёртый тон — нисходящий',
    description: 'Резкий нисходящий тон, как короткое и отрывистое восклицание. Голос падает сверху вниз.',
    pitch: '╲    ',
    example: '骂',
    examplePinyin: 'mà',
    exampleTranslation: 'ругать',
    color: 'bg-crimson-800',
  },
];
