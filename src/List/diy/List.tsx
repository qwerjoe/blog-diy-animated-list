import { ListItemId, ListProps } from "@/List/ListProps";
import { AnimDiv } from "@/diy";
import "@/List/list.css";

export function List<IdType extends ListItemId>({
  ids,
  renderItem,
}: ListProps<IdType>) {
  return (
    <div className="list-root">
      {ids.map((id) => (
        <AnimDiv key={id}>{renderItem(id)}</AnimDiv>
      ))}
    </div>
  );
}
