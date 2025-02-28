import { ReactNode } from "react";

type ListItemId = number | string;

type ListProps<IdType extends ListItemId> = {
  ids: IdType[];
  renderItem: (id: IdType) => ReactNode;
};

export type { ListProps, ListItemId };
