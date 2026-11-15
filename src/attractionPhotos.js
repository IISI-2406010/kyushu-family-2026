function photo(id, label, file, author, license) {
  const [type, version] = license.split(' ')
  const licensePath = type === 'CC0' ? 'publicdomain/zero' : 'licenses/' + type.toLowerCase().slice(3)
  return {
    id, label, author, license,
    source: 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file),
    licenseUrl: `https://creativecommons.org/${licensePath}/${version}/`,
  }
}

const tenjin = photo('tenjin', '福岡天神街景', 'Fukuoka-tenjin.jpg', 'Hactar', 'CC-BY-SA 3.0')

export const attractionPhotos = {
  '高千穗峽划船': [
    { id: 'takachiho-boating', label: '高千穗峽的划船與瀑布' },
    { id: 'takachiho-boating-closeup', label: '從船上近看真名井瀑布' },
  ],
  '搭乘高千穗小火車、高千穗峽谷散步': [
    { id: 'takachiho-train-bridge', label: '高千穗小火車駛過鐵橋' },
    { id: 'takachiho-train-view', label: '從高千穗小火車望向前方鐵軌' },
  ],
  '阿蘇火山周邊景點': [
    { id: 'aso-grassland', label: '草千里與阿蘇山景' },
    { id: 'aso-group-photo', label: '草千里合照' },
    { id: 'aso-green-hill', label: '米塚' },
  ],
  '道の駅 あそ望の郷くぎの、Montbell 南阿蘇店': [
    { id: 'minamiaso-montbell', extension: 'avif', label: 'Montbell 南阿蘇店' },
    { id: 'asobonosato-kochia', label: '道の駅 あそ望の郷くぎの的波波草' },
  ],
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
