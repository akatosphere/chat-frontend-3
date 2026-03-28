ContextMenu основан на KebabMenu

# должен принимать

interface ContextMenuProps {
className: string; // доп класс
visible: boolean; // отображать или нет
items: KebabMenuItem[]; // список элементов
position: {
x: number;
y: number;
} | null; // позиция по пикселям курсора
}

# как использовать

# в родителе

const kebabItems = [];
const { handleContextMenu, isVisible, position, items } = useContextMenu();

<>
<button onContextMenu={e => handleContextMenu(e, kebabItems)}>
ОТКРЫТЬ КОНТЕКСТНОЕ МЕНЮ
</button>

 <ContextMenu visible={isVisible} position={position} items={items} />
</>
