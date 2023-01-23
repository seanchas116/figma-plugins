import React, { useEffect, useState } from "react";
import { iconData } from "../../state/IconData";
import type { IconifyInfo } from "@iconify/types";
import { observer } from "mobx-react-lite";
import { useInView } from "react-intersection-observer";
import { state } from "../../state/State";
import { action } from "mobx";
import { SearchInput } from "./SearchInput";
import { AllIconView, IconCollectionView } from "./IconCollectionView";

const AllIconCard: React.FC<{
  iconCount: number;
  onClick: () => void;
}> = ({ iconCount, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col p-2 justify-between h-12 border-gray-200 rounded border text-start hover:bg-gray-50"
    >
      <div className="font-semibold text-black">All</div>
      <div className="text-gray-500">{iconCount} Icons</div>
    </button>
  );
};

const IconCollectionCard: React.FC<{
  prefix: string;
  info: IconifyInfo;
  onClick: () => void;
}> = observer(({ prefix, info, onClick }) => {
  const { ref, inView } = useInView();

  const samples = info.samples?.slice(0, 3) ?? [];

  useEffect(() => {
    if (inView) {
      void iconData.fetchIcons(samples.map((sample) => prefix + ":" + sample));
    }
  }, [inView]);

  return (
    <button
      ref={ref}
      onClick={onClick}
      className="flex p-2 items-center justify-between border-gray-200 rounded border hover:bg-gray-50"
      style={{
        contentVisibility: "auto",
        // @ts-ignore
        containIntrinsicSize: "72px",
      }}
    >
      <div className="flex flex-col self-stretch text-start h-[56px]">
        <div className="font-semibold text-black">{info.name}</div>
        <div className="text-gray-500">{info.author.name}</div>
        <div className="flex mt-auto">
          <div className="text-gray-500 w-20">{info.total} Icons</div>
          <div className="text-gray-500">{info.license.title}</div>
        </div>
      </div>
      <div className="flex gap-1 text-gray-700">
        {samples.map((sample) => {
          const icon = iconData.icons.get(prefix + ":" + sample);
          if (icon) {
            return (
              <svg
                key={sample}
                className="w-4 h-4"
                viewBox={`0 0 ${icon.width ?? 24} ${icon.width ?? 24}`}
                dangerouslySetInnerHTML={{
                  __html: icon.body,
                }}
              />
            );
          }
        })}
      </div>
    </button>
  );
});

export const IconsPanel: React.FC = observer(() => {
  useEffect(() => {
    void iconData.fetchCollectionInfos();
  }, []);

  const prefix = state.iconCollectionPrefix;
  const [query, setQuery] = useState("");

  if (prefix) {
    if (prefix === "all") {
      return (
        <AllIconView
          onBack={action(() => {
            state.iconCollectionPrefix = undefined;
          })}
        />
      );
    }

    return (
      <IconCollectionView
        prefix={prefix}
        onBack={action(() => {
          state.iconCollectionPrefix = undefined;
        })}
      />
    );
  }

  const totalCount = [...iconData.collectionInfos.values()]
    .map((info) => info.total ?? 0)
    .reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col min-h-0">
      <SearchInput
        placeholder="Search Collections"
        value={query}
        onChangeValue={setQuery}
      />
      <div className="flex-1 min-h-0 overflow-scroll px-2 py-2 flex flex-col gap-2">
        {!query && (
          <AllIconCard
            iconCount={totalCount}
            onClick={() => {
              state.iconCollectionPrefix = "all";
              // TODO
            }}
          />
        )}
        {iconData.searchCollectionInfos(query).map(([prefix, info]) => (
          <IconCollectionCard
            key={prefix}
            prefix={prefix}
            info={info}
            onClick={action(() => {
              state.iconCollectionPrefix = prefix;
            })}
          />
        ))}
      </div>
    </div>
  );
});
