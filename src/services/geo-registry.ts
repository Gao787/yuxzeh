import type { GeoInfo, DrillLevel } from '@/types/map'

/**
 * GeoJSON 注册表：区域代码 → GeoJSON 文件映射
 * adcode 规则：https://www.mca.gov.cn/article/sj/xzqh/
 */
export const GEO_REGISTRY: Record<string, GeoInfo> = {
  // 中国全国
  CN: {
    name: 'china',
    file: '/geojson/china-provinces.json',
    parentCode: '',
    level: 'country',
    hasChildren: true,
    displayName: '中国',
  },

  // === 直辖市 ===
  '110000': { name: 'beijing',   file: '/geojson/provinces/110000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '北京市' },
  '310000': { name: 'shanghai',  file: '/geojson/provinces/310000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '上海市' },
  '120000': { name: 'tianjin',   file: '/geojson/provinces/120000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '天津市' },
  '500000': { name: 'chongqing', file: '/geojson/provinces/500000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '重庆市' },

  // === 省份 ===
  '440000': { name: 'guangdong',    file: '/geojson/provinces/440000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '广东省' },
  '330000': { name: 'zhejiang',     file: '/geojson/provinces/330000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '浙江省' },
  '320000': { name: 'jiangsu',      file: '/geojson/provinces/320000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '江苏省' },
  '370000': { name: 'shandong',     file: '/geojson/provinces/370000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '山东省' },
  '410000': { name: 'henan',        file: '/geojson/provinces/410000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '河南省' },
  '510000': { name: 'sichuan',      file: '/geojson/provinces/510000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '四川省' },
  '420000': { name: 'hubei',        file: '/geojson/provinces/420000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '湖北省' },
  '430000': { name: 'hunan',        file: '/geojson/provinces/430000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '湖南省' },
  '350000': { name: 'fujian',       file: '/geojson/provinces/350000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '福建省' },
  '450000': { name: 'guangxi',      file: '/geojson/provinces/450000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '广西壮族自治区' },
  '520000': { name: 'guizhou',      file: '/geojson/provinces/520000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '贵州省' },
  '530000': { name: 'yunnan',       file: '/geojson/provinces/530000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '云南省' },
  '130000': { name: 'hebei',        file: '/geojson/provinces/130000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '河北省' },
  '140000': { name: 'shanxi',       file: '/geojson/provinces/140000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '山西省' },
  '210000': { name: 'liaoning',     file: '/geojson/provinces/210000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '辽宁省' },
  '220000': { name: 'jilin',       file: '/geojson/provinces/220000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '吉林省' },
  '230000': { name: 'heilongjiang', file: '/geojson/provinces/230000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '黑龙江省' },
  '340000': { name: 'anhui',        file: '/geojson/provinces/340000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '安徽省' },
  '360000': { name: 'jiangxi',      file: '/geojson/provinces/360000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '江西省' },
  '460000': { name: 'hainan',       file: '/geojson/provinces/460000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '海南省' },
  '150000': { name: 'neimenggu',    file: '/geojson/provinces/150000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '内蒙古自治区' },
  '540000': { name: 'xizang',       file: '/geojson/provinces/540000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '西藏自治区' },
  '620000': { name: 'gansu',        file: '/geojson/provinces/620000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '甘肃省' },
  '630000': { name: 'qinghai',      file: '/geojson/provinces/630000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '青海省' },
  '640000': { name: 'ningxia',      file: '/geojson/provinces/640000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '宁夏回族自治区' },
  '650000': { name: 'xinjiang',     file: '/geojson/provinces/650000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '新疆维吾尔自治区' },
  '610000': { name: 'shaanxi',      file: '/geojson/provinces/610000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '陕西省' },
  '710000': { name: 'taiwan',       file: '/geojson/provinces/710000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '台湾省' },
  '810000': { name: 'hongkong',     file: '/geojson/provinces/810000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '香港特别行政区' },
  '820000': { name: 'macau',        file: '/geojson/provinces/820000.json', parentCode: 'CN', level: 'province', hasChildren: true, displayName: '澳门特别行政区' },
}

/** 根据区域代码获取 Geo 信息 */
export function getGeoInfo(code: string): GeoInfo | undefined {
  return GEO_REGISTRY[code]
}

/** 根据区域名称查找代码（在当前 features 中） */
export function findCodeByName(name: string, features: { properties: { name: string; adcode?: number } }[]): string {
  const f = features.find(f => f.properties.name === name)
  if (f?.properties.adcode) return String(f.properties.adcode)
  // fallback: 遍历 GEO_REGISTRY
  for (const [code, info] of Object.entries(GEO_REGISTRY)) {
    if (info.displayName === name) return code
  }
  return name
}
