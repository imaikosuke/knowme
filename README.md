This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## ゲームの流れ
1. トップページにアクセスするとログインなどは必要とせずニックネームを入力するテキストフィールドと「ルームを作成する」と「ルームに参加する」のどちらかのボタンを選択することができる。

2. ルームを作成するを選択した場合は、他のIDと重複のない四桁のルームIDが表示されて、コピーできる

3. ルームに参加するを選択した場合は、参加したいルームのIDを入力する

4. ルームを作成した人がゲーム開始ボタンを押すと、それ以降のルーム参加はできず、ゲームが開始する

5. ゲームの参加者の中から一人がランダムに選ばれる

6. ランダムに選ばれた人は質問に答える

7. 質問に対する回答以外に生成AIであるOpenAI APIで解答例を三つ生成して、ユーザーの本当の回答一つに加えて偽物三つにする。

8. 質問と回答四つがデータベースに保存されたら、他のゲーム参加者はランダムに選ばれた人が回答した質問と回答四つが表示される。

9. ゲーム参加者が、ランダムに選ばれた人が質問に対してした真の回答だと思う選択肢一つ選びます。

10. ランダムに選ばれた人の質問に対してした真の回答を正解したゲーム参加者だけが残り、不正解の人はゲームから敗退します。

11. 5-10のゲーム進行を参加者が最後の一人だけ残るまで繰り返します。

15. 残り人数が最後の一人になったら最終結果を表示してゲームを終了します。