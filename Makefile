.PHONY: start ios android lint format typecheck install prebuild help

help:
	@echo "使用可能なコマンド:"
	@echo "  make start           - Expo開発サーバーを起動"
	@echo "  make ios             - iOSシミュレータで起動"
	@echo "  make android         - Androidエミュレータで起動"
	@echo "  make lint            - ESLintでコードをチェック"
	@echo "  make format          - Prettierでコードフォーマット"
	@echo "  make typecheck       - TypeScriptの型チェックを実行"
	@echo "  make install         - 依存関係をインストール"
	@echo "  make prebuild        - Expoプレビルド（ネイティブプロジェクト生成）"

start:
	yarn start

ios:
	yarn ios

android:
	yarn android

lint:
	yarn lint

format:
	yarn format

typecheck:
	yarn typecheck

install:
	yarn install

prebuild:
	npx expo prebuild
