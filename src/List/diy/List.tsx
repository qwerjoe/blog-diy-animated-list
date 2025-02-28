import { ListItemId, ListProps } from "@/List/ListProps";
import "@/List/list.css";

export function List<IdType extends ListItemId>({
  ids,
  renderItem,
}: ListProps<IdType>) {
  return (
    <div className="list-root">
      {ids.map((id) => (
        <div key={id}>{renderItem(id)}</div>
      ))}
    </div>
  );
}
