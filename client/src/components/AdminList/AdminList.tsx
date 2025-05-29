import React from 'react';
import styles from './AdminList.module.css'; // Criaremos este CSS

type AdminListProps<T> = {
  items: T[];
  renderItemContent: (item: T) => React.ReactNode; // Conteúdo principal do item
  addItemLabel: string;
  itemKeyExtractor: (item: T) => string | number;
  onEditItem?: (item: T) => void; // Opcional: Função para editar
  onDeleteItem?: (item: T) => void; // Opcional: Função para deletar
  onAddItem: () => void; // Função para adicionar novo item

}

export function AdminList<T>({
  items,
  renderItemContent,
  addItemLabel,
  itemKeyExtractor,
  onEditItem,
  onDeleteItem,
  onAddItem,
}: AdminListProps<T>) {

  return (
    <ul className={styles.admin_list}>
      <li className={`${styles.admin_list_item} ${styles.admin_list_item_add}`}>
        <button onClick={onAddItem} className={styles.add_item_link_button}>
          + {addItemLabel}
        </button>
      </li>
      {items.map((item) => (
        <li key={itemKeyExtractor(item)} className={styles.admin_list_item}>
          <div className={styles.admin_list_item_content_wrapper}>
            {renderItemContent(item)}
          </div>
          <div className={styles.admin_list_item_actions}>
            {onEditItem && <button onClick={() => onEditItem(item)}>Editar</button>}
            {onDeleteItem && <button onClick={() => onDeleteItem(item)}>Excluir</button>}
          </div>
        </li>
      ))}
    </ul>
  );
}
