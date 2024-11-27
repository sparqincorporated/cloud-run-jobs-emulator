# ベースイメージとして公式のNode.jsイメージを使用
FROM node:18-alpine

# アプリケーションディレクトリを作成
WORKDIR /usr/src/app

# アプリケーションのコードをコンテナにコピー
COPY index.ts .

# 実行コマンドを指定
CMD ["npx", "tsx", "index.ts"]
