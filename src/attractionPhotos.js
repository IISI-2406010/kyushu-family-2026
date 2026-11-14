function photo(id, label, file, author, license) {
  const [type, version] = license.split(' ')
  const licensePath = type === 'CC0' ? 'publicdomain/zero' : 'licenses/' + type.toLowerCase().slice(3)
  return {
    id, label, author, license,
    source: 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file),
    licenseUrl: `https://creativecommons.org/${licensePath}/${version}/`,
  }
}

const gorge = photo('gorge', '高千穗峽與真名井瀑布', 'Takachiho-gorge.jpg', 'Takasunrise0921', 'CC-BY 2.5')
const tenjin = photo('tenjin', '福岡天神街景', 'Fukuoka-tenjin.jpg', 'Hactar', 'CC-BY-SA 3.0')

export const attractionPhotos = {
  '高千穗峽划船': [gorge],
  '搭乘高千穗小火車、高千穗峽谷散步': [
    photo('railway', '高千穗小火車', 'Amaterasu.takachiho.jpg', 'ブルーノ', 'CC-BY-SA 4.0'), gorge,
  ],
  '阿蘇火山周邊景點': [photo('aso', '阿蘇中岳火山口', 'Aso_crater.jpg', 'Olli Salonen', 'CC-BY-SA 2.5')],
  '白川水源': [photo('spring', '白川水源', 'Shirakawa_Spring_01.jpg', 'STA3816', 'CC-BY-SA 3.0')],
  '上色見熊野座神社': [photo('kamishikimi', '上色見熊野座神社', 'Kamishikimi_Kumanoimasu_Shrine_001.jpg', 'ageo_akaihana', 'CC-BY 2.0')],
  '九重夢大吊橋': [photo('bridge', '九重夢大吊橋', 'Kokonoe-Yume-Otsurihashi-1.jpg', 'TANAKA Juuyoh', 'CC-BY 2.0')],
  '金鱗湖走走看看拍拍': [photo('kinrin', '由布院金鱗湖', 'Lake_Kinrin.jpg', 'STA3816', 'CC-BY-SA 3.0')],
  '參拜竈門神社': [photo('kamado', '寶滿宮竈門神社', 'Kamado_shrine_01.JPG', 'Miya.m', 'CC-BY-SA 3.0')],
  '太宰府天滿宮參拜、逛太宰府天滿宮參道': [photo('dazaifu', '太宰府天滿宮', 'Dazaifu_Tenmangu.jpg', 'Drivephotographer', 'CC0 1.0')],
  '大濠公園、舞鶴公園': [photo('ohori', '大濠公園', 'Ohori_Park_01.jpg', 'STA3816', 'CC-BY-SA 3.0')],
  '博多耶誕城': [photo('hakata-market', '博多站前聖誕市集（2018 年）', 'Christmas_Market_in_front_of_Hakata_Station.jpg', 'そらみみ', 'CC-BY-SA 4.0')],
  '逛天神商圈': [tenjin],
  '繼續逛天神商圈': [tenjin],
}
