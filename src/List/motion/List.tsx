import { ListItemId, ListProps } from "@/List/ListProps";
import { AnimatePresence, motion } from "motion/react";
import "@/List/list.css";

export function List<IdType extends ListItemId>({
  ids,
  renderItem,
}: ListProps<IdType>) {
  return (
    <div className="list-root">
      <AnimatePresence>
        {ids.map((id) => (
          <motion.div
            layout
            key={id}
            initial={{ opacity: 0, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            transition={{ duration: 0.2 }}
          >
            {renderItem(id)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
