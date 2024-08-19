# KnowMe?

KnowMe?は、ゲーム参加者の質問の回答を推測し合う楽しいオンラインゲームです。
- 友達や家族、同僚がお互いをどれだけ知っているかテストできる
- 初めましての人たちでもお互いのことを知るきっかけになる

## 特徴

- リアルタイムマルチプレイヤーゲーム
- 質問の嘘の回答を自動生成（OpenAI APIを使用）
- 簡単なルーム作成とゲーム参加
- レスポンシブデザイン

## 技術スタック

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Firebase Realtime Database](https://firebase.google.com/products/realtime-database)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## セットアップ

1. リポジトリをクローンします：
   ```
   git clone https://github.com/yourusername/knowme.git
   cd knowme
   ```

2. 依存関係をインストールします：
   ```
   npm install
   ```

3. `.env.local` ファイルを作成し、必要な環境変数を設定します：
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   OPENAI_API_KEY=your_openai_api_key
   ```

4. 開発サーバーを起動します：
   ```
   npm run dev
   ```

5. ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## ゲームの遊び方

1. ホームページでニックネームを入力し、新しいルームを作成するか既存のルームに参加します。
2. ルーム内で他のプレイヤーを待ちます。
3. ゲームが開始されたら、参加者の中で１人だけ質問に答えます。
4. そのプレイヤーの回答を予想します。
5. 正解すると次のラウンドに進みます。不正解の場合は脱落します。
6. 最後まで残ったプレイヤーが勝者となります！
