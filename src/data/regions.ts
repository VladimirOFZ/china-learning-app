export interface Region {
  id: string;
  name: string;
  chineseName: string;
  pinyin: string;
  description: string;
  landmarks: {
    name: string;
    chineseName: string;
    description: string;
    imageUrl: string;
  }[];
  facts: string[];
  position: { top: string; left: string };
}

export const regionsData: Region[] = [
  {
    id: 'beijing',
    name: 'Пекин',
    chineseName: '北京',
    pinyin: 'Běijīng',
    description: 'Столица Китая — один из древнейших городов мира с более чем 3000-летней историей. Политический и культурный центр страны.',
    landmarks: [
      {
        name: 'Запретный город',
        chineseName: '故宫',
        description: 'Дворцовый комплекс из 980 зданий, служивший резиденцией 24 императорам династий Мин и Цин.',
        imageUrl: 'https://images.pexels.com/photos-2325535/pexels-photo-2325535.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
      {
        name: 'Великая стена (Бадалин)',
        chineseName: '长城',
        description: 'Самый известный участок Великой Китайской стены, расположенный в 70 км к северу от Пекина.',
        imageUrl: 'https://images.pexels.com/photos-161246/pexels-photo-161246.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
    ],
    facts: [
      'Население Пекина превышает 21 миллион человек',
      'В городе находится 7 объектов Всемирного наследия ЮНЕСКО',
      'Пекинский диалект лежит в основе путунхуа — официального языка Китая',
    ],
    position: { top: '32%', left: '58%' },
  },
  {
    id: 'shanghai',
    name: 'Шанхай',
    chineseName: '上海',
    pinyin: 'Shànghǎi',
    description: 'Крупнейший город Китая и один из главных финансовых центров мира. Сочетает колониальную архитектуру и футуристические небоскрёбы.',
    landmarks: [
      {
        name: 'Набережная Вайтань',
        chineseName: '外滩',
        description: 'Знаменитая набережная с видом на небоскрёбы района Пудун — символ современного Шанхая.',
        imageUrl: 'https://images.pexels.com/photos-1878393/pexels-photo-1878393.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
      {
        name: 'Сад Юйюань',
        chineseName: '豫园',
        description: 'Классический китайский сад XVI века с павильонами, прудами и мостами в традиционном стиле.',
        imageUrl: 'https://images.pexels.com/photos-1438172/pexels-photo-1438172.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
    ],
    facts: [
      'Шанхайская башня — второе по высоте здание в мире (632 м)',
      'Город обслуживает крупнейший в мире порт по грузообороту',
      'В Шанхае живёт более 24 миллионов человек',
    ],
    position: { top: '58%', left: '68%' },
  },
  {
    id: 'xian',
    name: 'Сиань',
    chineseName: '西安',
    pinyin: 'Xī\'ān',
    description: 'Древняя столица Китая — стартовая точка Шёлкового пути. Здесь находится знаменитая Терракотовая армия.',
    landmarks: [
      {
        name: 'Терракотовая армия',
        chineseName: '兵马俑',
        description: 'Более 8 000 терракотовых воинов, созданных для охраны гробницы императора Цинь Шихуанди.',
        imageUrl: 'https://images.pexels.com/photos-2230605/pexels-photo-2230605.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
      {
        name: 'Городская стена',
        chineseName: '城墙',
        description: 'Лучше всего сохранившаяся крепостная стена в Китае, протяжённостью 13,7 км.',
        imageUrl: 'https://images.pexels.com/photos-2076624/pexels-photo-2076624.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
    ],
    facts: [
      'Сиань был столицей 13 династий на протяжении более 1000 лет',
      'Терракотовая армия была случайно обнаружена фермерами в 1974 году',
      'Башня Колокола построена в 1384 году при династии Мин',
    ],
    position: { top: '48%', left: '42%' },
  },
  {
    id: 'guilin',
    name: 'Гуйлинь',
    chineseName: '桂林',
    pinyin: 'Guìlín',
    description: 'Регион, славящийся своими карстовыми горами и живописными пейзажами, воспетыми китайскими поэтами на протяжении веков.',
    landmarks: [
      {
        name: 'Река Лицзян',
        chineseName: '漓江',
        description: '83-километровый участок реки между Гуйлинем и Яншо — один из самых живописных в Китае.',
        imageUrl: 'https://images.pexels.com/photos-1276209/pexels-photo-1276209.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
    ],
    facts: [
      'Карстовые пейзажи Гуйлиня изображены на купюре в 20 юаней',
      'Регион привлекает более 10 миллионов туристов ежегодно',
      'Здесь находятся пещеры с сталактитами возрастом миллионы лет',
    ],
    position: { top: '75%', left: '48%' },
  },
  {
    id: 'chengdu',
    name: 'Чэнду',
    chineseName: '成都',
    pinyin: 'Chéngdū',
    description: 'Столица провинции Сычуань — родина острого сычуаньского перца и место обитания больших панд.',
    landmarks: [
      {
        name: 'Центр разведения панд',
        chineseName: '熊猫基地',
        description: 'Научно-исследовательский центр, где можно увидеть более 80 больших панд в естественной среде.',
        imageUrl: 'https://images.pexels.com/photos-4632488/pexels-photo-4632488.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
    ],
    facts: [
      'Чэнду — единственный город в мире, где живут большие панды в черте города',
      'Сычуаньская кухня входит в 4 великие кулинарные традиции Китая',
      'В Чэнду более 3000 лет истории непрерывного обитания',
    ],
    position: { top: '55%', left: '32%' },
  },
  {
    id: 'hongkong',
    name: 'Гонконг',
    chineseName: '香港',
    pinyin: 'Xiānggǎng',
    description: 'Особый административный район Китая — финансовый центр с уникальным сочетанием восточной и западной культур.',
    landmarks: [
      {
        name: 'Пик Виктория',
        chineseName: '太平山顶',
        description: 'Вершина высотой 552 м с панорамным видом на небоскрёбы и залив Виктория.',
        imageUrl: 'https://images.pexels.com/photos-2884866/pexels-photo-2884866.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
    ],
    facts: [
      'В Гонконге больше небоскрёбов, чем в Нью-Йорке',
      'Город имеет одну из самых эффективных транспортных систем в мире',
      'Гонконг вернулся под суверенитет Китая в 1997 году',
    ],
    position: { top: '82%', left: '62%' },
  },
];
