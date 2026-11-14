# 九州孝親旅行

Vue 3 與 Vite 製作的手機行程網站。修改 `行程.md` 即可更新總覽和每日內容。日期判斷使用日本時間（Asia/Tokyo），2026/11/18–11/23 首次開啟會顯示當日行程，其餘日期顯示總覽。

## 本機預覽

請使用 Node.js 22.12 以上的 22.x 版本。

```sh
npm ci
npm run dev
```

## GitHub Pages

1. 把此資料夾的專案檔放在 GitHub 儲存庫根目錄，使用 `main` 分支。請包含 `.github/workflows/pages.yml`。
2. 在儲存庫中開啟 **Settings → Pages**，把 **Source** 選為 **GitHub Actions**。
3. 推送至 `main` 或在 **Actions → Deploy itinerary to GitHub Pages** 按 **Run workflow**。完成後在 **Settings → Pages** 取得網址。

網站會顯示 `行程.md` 內的航班與住宿資料。若啟用公開的 GitHub Pages，任何知道網址的人都可查看這些資訊。

[GitHub Pages 自訂部署流程](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
