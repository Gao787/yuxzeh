/**
 * 搜索索引：省市名称 + 拼音（简化版）
 * 后续可从 GeoJSON properties 动态生成
 */
export interface SearchItem {
  name: string
  code: string
  level: string       // 'province' | 'city'
  parentName: string  // 隶属
  pinyin: string
  pinyinAbbr: string
}

// 预置中国 34 个省级行政区的搜索索引
// 完整的市县级索引在加载 GeoJSON 时动态追加
export const PROVINCE_SEARCH_INDEX: SearchItem[] = [
  { name: '北京市',     code: '110000', level: 'province', parentName: '中国', pinyin: 'beijing',      pinyinAbbr: 'bj' },
  { name: '天津市',     code: '120000', level: 'province', parentName: '中国', pinyin: 'tianjin',      pinyinAbbr: 'tj' },
  { name: '上海市',     code: '310000', level: 'province', parentName: '中国', pinyin: 'shanghai',     pinyinAbbr: 'sh' },
  { name: '重庆市',     code: '500000', level: 'province', parentName: '中国', pinyin: 'chongqing',    pinyinAbbr: 'cq' },
  { name: '广东省',     code: '440000', level: 'province', parentName: '中国', pinyin: 'guangdong',    pinyinAbbr: 'gd' },
  { name: '浙江省',     code: '330000', level: 'province', parentName: '中国', pinyin: 'zhejiang',     pinyinAbbr: 'zj' },
  { name: '江苏省',     code: '320000', level: 'province', parentName: '中国', pinyin: 'jiangsu',      pinyinAbbr: 'js' },
  { name: '山东省',     code: '370000', level: 'province', parentName: '中国', pinyin: 'shandong',     pinyinAbbr: 'sd' },
  { name: '河南省',     code: '410000', level: 'province', parentName: '中国', pinyin: 'henan',        pinyinAbbr: 'hn' },
  { name: '四川省',     code: '510000', level: 'province', parentName: '中国', pinyin: 'sichuan',      pinyinAbbr: 'sc' },
  { name: '湖北省',     code: '420000', level: 'province', parentName: '中国', pinyin: 'hubei',        pinyinAbbr: 'hb' },
  { name: '湖南省',     code: '430000', level: 'province', parentName: '中国', pinyin: 'hunan',        pinyinAbbr: 'hun' },
  { name: '福建省',     code: '350000', level: 'province', parentName: '中国', pinyin: 'fujian',       pinyinAbbr: 'fj' },
  { name: '河北省',     code: '130000', level: 'province', parentName: '中国', pinyin: 'hebei',        pinyinAbbr: 'heb' },
  { name: '山西省',     code: '140000', level: 'province', parentName: '中国', pinyin: 'shanxi',       pinyinAbbr: 'sx' },
  { name: '辽宁省',     code: '210000', level: 'province', parentName: '中国', pinyin: 'liaoning',    pinyinAbbr: 'ln' },
  { name: '吉林省',     code: '220000', level: 'province', parentName: '中国', pinyin: 'jilin',        pinyinAbbr: 'jl' },
  { name: '黑龙江省',   code: '230000', level: 'province', parentName: '中国', pinyin: 'heilongjiang', pinyinAbbr: 'hlj' },
  { name: '安徽省',     code: '340000', level: 'province', parentName: '中国', pinyin: 'anhui',        pinyinAbbr: 'ah' },
  { name: '江西省',     code: '360000', level: 'province', parentName: '中国', pinyin: 'jiangxi',      pinyinAbbr: 'jx' },
  { name: '海南省',     code: '460000', level: 'province', parentName: '中国', pinyin: 'hainan',       pinyinAbbr: 'hain' },
  { name: '云南省',     code: '530000', level: 'province', parentName: '中国', pinyin: 'yunnan',       pinyinAbbr: 'yn' },
  { name: '贵州省',     code: '520000', level: 'province', parentName: '中国', pinyin: 'guizhou',      pinyinAbbr: 'gz' },
  { name: '陕西省',     code: '610000', level: 'province', parentName: '中国', pinyin: 'shaanxi',      pinyinAbbr: 'shx' },
  { name: '甘肃省',     code: '620000', level: 'province', parentName: '中国', pinyin: 'gansu',        pinyinAbbr: 'gs' },
  { name: '青海省',     code: '630000', level: 'province', parentName: '中国', pinyin: 'qinghai',      pinyinAbbr: 'qh' },
  { name: '台湾省',     code: '710000', level: 'province', parentName: '中国', pinyin: 'taiwan',       pinyinAbbr: 'tw' },
  { name: '内蒙古自治区', code: '150000', level: 'province', parentName: '中国', pinyin: 'neimenggu',   pinyinAbbr: 'nmg' },
  { name: '广西壮族自治区', code: '450000', level: 'province', parentName: '中国', pinyin: 'guangxi',  pinyinAbbr: 'gx' },
  { name: '西藏自治区',   code: '540000', level: 'province', parentName: '中国', pinyin: 'xizang',      pinyinAbbr: 'xz' },
  { name: '宁夏回族自治区', code: '640000', level: 'province', parentName: '中国', pinyin: 'ningxia',  pinyinAbbr: 'nx' },
  { name: '新疆维吾尔自治区', code: '650000', level: 'province', parentName: '中国', pinyin: 'xinjiang', pinyinAbbr: 'xj' },
  { name: '香港特别行政区', code: '810000', level: 'province', parentName: '中国', pinyin: 'xianggang',  pinyinAbbr: 'xg' },
  { name: '澳门特别行政区', code: '820000', level: 'province', parentName: '中国', pinyin: 'aomen',      pinyinAbbr: 'am' },
]

/**
 * 从 GeoJSON features 中提取城市列表并追加到搜索索引
 */
export function buildCityIndex(features: any[], parentName: string, parentCode: string): SearchItem[] {
  return features.map(f => ({
    name: f.properties.name,
    code: f.properties.adcode ? String(f.properties.adcode) : f.properties.name,
    level: 'city',
    parentName,
    pinyin: '',
    pinyinAbbr: '',
  }))
}
