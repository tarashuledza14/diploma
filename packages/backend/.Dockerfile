# 1. Обираємо базовий образ
FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app

# 2. Копіюємо "каркас" монорепозиторію
# Нам потрібні ці файли, щоб pnpm розумів, як пов'язані пакети
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./

# 3. Копіюємо лише конфігурацію бекенду (без коду)
# Це дозволяє Docker кешувати встановлення бібліотек
COPY packages/backend/package.json ./packages/backend/

# 4. Встановлюємо залежності
# --frozen-lockfile гарантує, що версії будуть точно як у твоєму lock-файлі
RUN pnpm install --frozen-lockfile

# 5. Копіюємо весь код бекенду та спільні конфіги (наприклад, tsconfig)
COPY packages/backend ./packages/backend

# 6. Збираємо проект
# Використовуємо --filter, щоб білдити лише бекенд
RUN pnpm --filter backend build

# 7. Запуск застосунку
WORKDIR /app/packages/backend
EXPOSE 3000
CMD ["node", "dist/src/main.js"]