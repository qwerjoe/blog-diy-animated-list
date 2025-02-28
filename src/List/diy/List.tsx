import { ListItemId, ListProps } from "@/List/ListProps";
import { AnimDiv, AnimationProps } from "@/diy";
import "@/List/list.css";

const kInitialState: AnimationProps = { opacity: 0 };
const kTargetState: AnimationProps = { opacity: 1, options: { duration: 300 } };

export function List<IdType extends ListItemId>({
  ids,
  renderItem,
}: ListProps<IdType>) {
  return (
    <div className="list-root">
      {ids.map((id) => (
        <AnimDiv
          initial={kInitialState}
          animate={kTargetState}
          options={{ duration: 200 }}
          key={id}
        >
          {renderItem(id)}
        </AnimDiv>
      ))}
    </div>
  );
}
