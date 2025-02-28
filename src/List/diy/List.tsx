import { ListItemId, ListProps } from "@/List/ListProps";
import { AnimDiv, AnimPresence, AnimationProps } from "@/diy";
import "@/List/list.css";

const kInitialState: AnimationProps = { opacity: 0 };
const kTargetState: AnimationProps = { opacity: 1, options: { duration: 300 } };
const kExitState: AnimationProps = {
  opacity: 0,
  options: { duration: 300, easing: "ease-out" },
};

export function List<IdType extends ListItemId>({
  ids,
  renderItem,
}: ListProps<IdType>) {
  return (
    <div className="list-root">
      <AnimPresence>
        {ids.map((id) => (
          <AnimDiv
            initial={kInitialState}
            animate={kTargetState}
            exit={kExitState}
            options={{ duration: 200 }}
            key={id}
          >
            {renderItem(id)}
          </AnimDiv>
        ))}
      </AnimPresence>
    </div>
  );
}
