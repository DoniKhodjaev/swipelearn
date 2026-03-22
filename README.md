# SwipeLearn

**Листай. Учись. Расти.**

TikTok-style обучающие карточки — PWA приложение для изучения Excel, VBA, языков и финансов.

## Возможности

- 📚 **327+ карточек** по 9 направлениям
- ↕️ **Свайп-лента** как в TikTok
- 🎯 **5 уровней** сложности
- 🤖 **AI-генерация** новых карточек (Claude Haiku 4.5)
- 📱 **PWA** — установи на телефон
- 🔖 **Закладки** для повторения
- 🌙 **Оффлайн** режим

## Направления

| Категория | Тема | Карточек |
|-----------|------|----------|
| 💻 Tech | Excel | 97 |
| 💻 Tech | VBA | 61 |
| 💻 Tech | Add-In | 28 |
| 🌍 Languages | Deutsch | 36 |
| 🌍 Languages | English | 24 |
| 🌍 Languages | 日本語 | 21 |
| 💰 Finance | Investment Banking | 20 |
| 💰 Finance | Private Equity | 17 |
| 💰 Finance | Commercial Banking | 23 |

## Установка на телефон

1. Откройте в браузере на телефоне
2. Нажмите "Добавить на главный экран" (Share → Add to Home Screen)
3. Готово — приложение работает оффлайн

## GitHub Pages Deployment

```bash
# 1. Создайте репозиторий на GitHub
# 2. Загрузите файлы:
git init
git add .
git commit -m "SwipeLearn v1.0"
git remote add origin https://github.com/YOUR_USERNAME/swipelearn.git
git push -u origin main

# 3. Settings → Pages → Source: main branch → Save
# 4. Откройте https://YOUR_USERNAME.github.io/swipelearn/
```

## AI-генерация

По умолчанию работает в оффлайн-режиме с предзагруженными карточками. Для AI-генерации:

1. Включите переключатель "AI генерация" в меню
2. API-ключ передаётся через GitHub Pages proxy (настроить самостоятельно)

Модель: `claude-haiku-4-5-20251001` (~$0.002 за карточку)

## Структура проекта

```
swipelearn/
├── index.html      # Landing page
├── app.html        # Основное приложение (React)
├── manifest.json   # PWA manifest
├── sw.js           # Service Worker
├── README.md
├── data/
│   └── cards.js    # 327+ карточек
└── icons/
    ├── icon-192.svg
    ├── icon-512.svg
    └── [topic].svg  # Иконки направлений
```

## Технологии

- React 18 (CDN, без сборки)
- PWA (Service Worker, Manifest)
- Claude Haiku 4.5 API (опционально)
- Vanilla CSS (без фреймворков)

---

*Made with ♡ and Claude AI*
