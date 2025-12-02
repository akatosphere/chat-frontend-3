# Icon Component

Универсальный компонент для отображения SVG-иконок в проекте. Поддерживает динамическую загрузку иконок по имени, настройку
размера и цвета через props или CSS, полностью совместим с SCSS и FSD-архитектурой.

📦 Структура

```
shared/
└── ui/
    └── Icon/
        ├── Icon.tsx          // основной компонент
        ├── types.ts          // типы IconName и IconProps
        └── icons/            // папка с именованными SVG-иконками
            ├── BackIcon.tsx
            ├── ChatIcon.tsx
            └── ... (все иконки экспортируются как именованные)
```

✨ Основные возможности
Отображение иконок по строковому имени (name="chat")
Гибкое управление цветом через:
проп color
CSS-свойство color (через className или style)
Управление размером через проп size (число или строка)
Поддержка всех SVG-атрибутов (...restProps)
Автоматическая обработка кейсов: back → BackIcon
Безопасность: вывод предупреждения в консоль при отсутствии иконки

🧩 Типы
IconName (строго типизированный список)
type IconName =
| 'logo'
| 'info'
| 'back'
| 'forward'
| 'chat'
| 'close'
| 'paperclip'
| 'trash'
| 'contacts'
| 'settings'
| 'aservice'
| 'check'
| 'doubleCheck'
| 'volumeOff'
| 'microphone'
| 'copyMessage'
| 'send'
| 'phone'
| 'search'
| 'download'
| 'checkCircle'
| 'reply'
| 'edit'
| 'blackList'
| 'support'
| 'logout'
| ...;

    ⚠️ Добавление новой иконки требует:

Создать файл YourIcon.tsx в icons/
Экспортировать её в icons/index.ts
Добавить 'your' в тип IconName

🛠 Реализация

1. Иконки должны использовать currentColor

2. Компонент <Icon /> передаёт color как style={{ color }}, а не через fill
   Это гарантирует корректную работу как с fill-, так и с stroke-иконками.

📌 Примеры использования
Базовое использование
<Icon name="chat" />

С размером
<Icon name="send" size={20} />
<Icon name="logo" size="48px" />

С цветом через проп
<Icon name="close" color="red" size={24} />
<Icon name="check" color="#22c55e" />

Стилизация через CSS
<Icon name="checkCircle" className="success-icon" size={32} />

.success-icon {
color: #22c55e;
transition: transform 0.2s;
&:hover {
transform: rotate(15deg);
}
}
Внутри кнопки (круглая иконка-кнопка)

<button className={styles.iconBtn}><Icon name="back" size={18} /></button>
.iconBtn {
display: flex;
align-items: center;
justify-content: center;
width: 36px;
height: 36px;
padding: 0;
border: none;
border-radius: 50%;
background: #f0f0f0;
color: #333;
cursor: pointer;
}

🎨 Особенности стилизации

Цвет: всегда управляется через CSS-свойство color, не через fill.
Размер: задаётся одинаково для width и height.
Инлайн-блок: display: block по умолчанию — убирает лишние пробелы.
Прозрачность / hover / анимации — работают через внешний CSS.

🔄 Добавление новой иконки

1. Создайте файл src/shared/ui/Icon/icons/YourNewIcon.tsx:

# const YourNewIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (

<svg viewBox="0 0 24 24" fill="none" {...props}>
<path fill="currentColor" d="..." />
</svg>
);

# export default YourNewIcon

2. Экспортируйте в icons/index.ts

# export { default as YourNewIcon } from './YourNewIcon';

3. Добавьте имя в IconName

# export type IconName = ... | 'yourNew';

4. Используйте

<Icon name="yourNew" size={24} />

## Важно

Все SVG-иконки должны использовать fill="currentColor" или stroke="currentColor".
Не используйте border-color: none — правильно: border: none.
Размеры рекомендуется задавать в px или как число (конвертируется в px).
Компонент не зависит от сторонних библиотек — только React + SCSS.

✅ Этот компонент оптимален для использования в FSD-архитектуре: изолирован в shared/ui, переиспользуем, тестируем и поддерживаем.
