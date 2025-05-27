import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AdminList.module.css'; // Criaremos este CSS

interface AdminListProps<T> {
  items: T[];
  renderItemContent: (item: T) => React.ReactNode; // Conteúdo principal do item
  addItemLabel: string;
  addItemLink: string;
  itemKeyExtractor: (item: T) => string | number;
  onEditItem?: (item: T) => void; // Opcional: Função para editar
  onDeleteItem?: (item: T) => void; // Opcional: Função para deletar
}

export function AdminList<T>({
  items,
  renderItemContent,
  addItemLabel,
  addItemLink,
  itemKeyExtractor,
  onEditItem,
  onDeleteItem,
}: AdminListProps<T>) {
    
  return (
    <ul className={styles.admin_list}>
      <li className={`${styles.admin_list_item} ${styles.admin_list_item_add}`}>
        <Link to={addItemLink} className={styles.add_item_link}>
          + {addItemLabel}
        </Link>
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
