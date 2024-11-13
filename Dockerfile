# Вибір базового образу
FROM node:14

# Створюємо робочу директорію всередині контейнера
WORKDIR /app

# Копіюємо package.json і package-lock.json для установки залежностей
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо всі файли проекту
COPY . .

# Створюємо білд для продакшн
RUN npm run build

# Використовуємо базовий сервер для відображення статичних файлів
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
