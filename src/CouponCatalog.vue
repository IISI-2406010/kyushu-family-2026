<script setup>
const coupons = [
  {
    id: 'donki',
    name: '唐吉訶德（Don Quijote）',
    expires: '官方券頁未標截止日；以即時頁面為準',
    offer: '含稅消費滿 ¥11,000 折 5%，滿 ¥33,000 折 7%。',
    note: '請在結帳時開啟券頁出示動態條碼；截圖不可使用。免稅退稅可併用。',
    url: 'https://livejapan.com/public/operation/coupon/donki/ja.html',
    source: 'LIVE JAPAN 唐吉訶德優惠券',
  },
  {
    id: 'bic-camera',
    name: 'BicCamera',
    expires: '2027/04/30',
    offer: '依商品類別享最高 7% OFF；適用商品與條件請查看券頁。',
    note: '限符合免稅購物資格的旅客，優惠後消費需滿 ¥5,000；部分商品不適用。',
    url: 'https://livejapan.com/public/operation/coupon/biccamera/ja.html',
    source: 'LIVE JAPAN BicCamera 優惠券',
  },
  {
    id: 'drug-eleven',
    name: 'Drug Eleven',
    expires: '2027/02/28',
    offer: '含稅消費滿 ¥10,000 折 3%，滿 ¥30,000 折 5%，滿 ¥50,000 折 7%。',
    note: '僅限指定免稅店，福岡適用店鋪及使用條件請查看券頁。',
    url: 'https://www.callingtaiwan.com.tw/drug_eleven/',
    source: 'CallingTaiwan Drug Eleven 優惠券',
  },
  {
    id: 'tsuruha',
    name: '鶴羽藥妝（TSURUHA）',
    expires: '無相關優惠券',
    offer: '無相關優惠券',
    url: 'https://livejapan.com/public/operation/coupon/tsuruhadrug/ja.html',
    source: 'LIVE JAPAN 鶴羽藥妝資訊',
  },
  {
    id: 'matsukiyo',
    name: '松本清（マツキヨ）',
    expires: '2027/03/31',
    offer: '店內消費滿 ¥10,000 折 3%，滿 ¥30,000 折 5%，滿 ¥50,000 折 7%。',
    note: '請於付款前出示官方頁面；截圖或列印無效，且部分商品與店鋪不適用。',
    url: 'https://en.matsumotokiyoshi.net/coupon',
    source: '松本清官方優惠券頁',
  },
  {
    id: 'montbell',
    name: 'mont-bell',
    expires: '無相關優惠券',
    offer: '無相關優惠券',
    url: null,
    source: null,
  },
  {
    id: 'daimaru',
    name: '大丸百貨福岡天神店',
    expires: '2026/10/01 起，官方未公告截止日',
    offer: '訪日外國旅客於特選品牌、化妝品及腕錶賣場，出示護照享 5% 折扣。',
    note: '部分品牌、特價品及服務費等不適用；請以官方公告及現場說明為準。',
    url: 'https://www.daimaru-fukuoka.jp/info/detail/?cd=001997',
    source: '大丸福岡天神店官方優惠公告',
  },
]
</script>

<template>
  <section class="coupon-list" aria-label="店家優惠券">
    <details v-for="coupon in coupons" :id="'coupon-' + coupon.id" :key="coupon.id" class="coupon-card">
      <summary class="coupon-summary">
        <span class="coupon-shop">{{ coupon.name }}</span>
        <span class="coupon-expiry">效期：{{ coupon.expires }}</span>
        <span class="coupon-toggle" aria-hidden="true">展開　＋</span>
      </summary>
      <div class="coupon-expanded">
        <p class="coupon-offer">{{ coupon.offer }}</p>
        <p v-if="coupon.note" class="coupon-note">{{ coupon.note }}</p>
        <p v-else-if="coupon.url" class="coupon-note">未找到可確認於旅程期間使用的優惠券。</p>
        <p class="coupon-expiry coupon-expiry-expanded">效期：{{ coupon.expires }}</p>
        <a v-if="coupon.url" class="coupon-source" :href="coupon.url" target="_blank" rel="noopener noreferrer">
          開啟優惠券／官方資訊頁
          <span aria-hidden="true">↗</span>
        </a>
        <p v-if="coupon.source" class="coupon-source-name">資料來源：{{ coupon.source }}</p>
        <button class="coupon-close" type="button" @click="$event.currentTarget.closest('details').open = false">
          收合優惠券
        </button>
      </div>
    </details>
  </section>
</template>
