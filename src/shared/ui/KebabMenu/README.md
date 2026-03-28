# компонент KebabMenu

# обязательно должен принимать массив объектов следующего типа

const item = [
{
text: string; // текст
icon: ReactNode; // иконка
onClick: () => void; // что должно происходить при клике на каждый элемент
danger?: boolean; // если элемент должен быть красным (например удаление)
}
]

# использование:

!!!!!!!!!!!!!!!!!!!!

const [isMenuOpen, setIsMenuOpen] = useState(false);

const kebabItems: KebabMenuItem[] = [
{
text: 'Очистить чат',
icon: <Clear />,
onClick: () => {
console.log('1');
},
danger: false
},
{
text: 'Покинуть группу',
icon: <LogoutIcon />,
onClick: () => {
console.log('2');
},
danger: false
},
{
text: 'Удалить группу',
icon: <Trash />,
onClick: () => {
console.log('3');
},
danger: true
}
];

<KebabMenu
visible={isMenuOpen}
items={menuItems}
onClose={() => setIsMenuOpen(false)}
/>

# Родитель создаёт состояние const [isMenuOpen, setIsMenuOpen] = useState(false); и кнопку, которая его переключает.

!!!!!!!!!!!!!!!!!!!!

# почти всегда надо будет размещать этот элемент с position: fixed относительно какого-то элемента, тогда компонент надо разместить внутри этого блока,

!!!!!!!!!!!!!!

# и самостоятельно ему прописать position: fixed, right, left

!!!!!!!!!!!!!!
