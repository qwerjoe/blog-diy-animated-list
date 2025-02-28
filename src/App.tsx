import { List as MotionList } from "@/List/motion/List";
import { List as DiyList } from "@/List/diy/List";
import { PokeCard } from "./PokeCard/PokeCard";
import { useState } from "react";
import { ViewMode, ViewModeSelect } from "./ViewModeSelect/ViewMode";
import "./app.css";

const steps = [
  [1, 2, 3],
  [2, 3],
  [1, 3, 2],
  [2, 5, 4],
  [2, 5, 4, 6],
  [2, 4],
  [5, 6, 7, 8],
  [5, 6, 7],
  [8, 9, 5, 6, 7],
  [3, 8, 9, 10, 11],
];

function useListIds(allSteps: number[][]) {
  const [stepIdx, setStepIdx] = useState(0);

  return {
    ids: allSteps[stepIdx],
    nextStep: () => setStepIdx((idx) => (idx + 1) % allSteps.length),
  };
}

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("diy");
  const handeViewModeChange = (newMode: ViewMode) => {
    setViewMode(newMode);
  };

  const diyListVisible = viewMode == "diy" || viewMode === "side-by-side";
  const motionListVisible = viewMode == "motion" || viewMode === "side-by-side";

  const { ids, nextStep } = useListIds(steps);

  return (
    <div className="app">
      <button className="app--change-button" onClick={nextStep}>
        Change list
      </button>
      <ViewModeSelect value={viewMode} onChange={handeViewModeChange} />
      <div className="app--lists-container">
        {diyListVisible && (
          <DiyList ids={ids} renderItem={(id) => <PokeCard pokeId={id} />} />
        )}
        {motionListVisible && (
          <MotionList ids={ids} renderItem={(id) => <PokeCard pokeId={id} />} />
        )}
      </div>
    </div>
  );
}

export default App;
