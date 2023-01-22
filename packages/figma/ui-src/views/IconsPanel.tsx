import { Icon } from "@iconify/react";
import { createRef, useEffect, useState } from "react";
import { IconCollection, iconData } from "../state/IconData";
import type { IconifyInfo } from "@iconify/types";
import { observer } from "mobx-react-lite";
import { useInView } from "react-intersection-observer";
import { Select } from "../components/Input";

const SearchInput: React.FC<{
  placeholder: string;
  value: string;
  onChangeValue: (value: string) => void;
}> = ({ value, onChangeValue, placeholder }) => {
  return (
    <div className="relative h-10 border-b border-gray-200">
      <input
        type="text"
        placeholder={placeholder}
        className="absolute inset-0 px-4 py-3 pl-9 bg-transparent placeholder:text-gray-300 outline-none font-medium text-gray-900"
        autoFocus
        value={value}
        onChange={(event) => onChangeValue(event.currentTarget.value)}
      />
      <Icon
        icon="material-symbols:search"
        className="text-base absolute left-4 top-3 text-gray-300"
      />
    </div>
  );
};

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
      <div className="font-medium text-gray-500">{iconCount} Icons</div>
    </button>
  );
};

// WIP
const IconCollectionCard: React.FC<{
  prefix: string;
  info: IconifyInfo;
  onClick: () => void;
}> = observer(({ prefix, info, onClick }) => {
  const { ref, inView } = useInView();

  const samples = info.samples?.slice(0, 3) ?? [];

  useEffect(() => {
    if (inView) {
      iconData.fetchIcons(prefix, samples);
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
        <div className="font-medium text-gray-500">{info.author.name}</div>
        <div className="font-medium text-gray-500 mt-auto">
          {info.total} Icons
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
    iconData.fetchCollectionInfos();
  }, []);

  const [prefix, setPrefix] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState("");

  if (prefix) {
    return (
      <IconCollectionView prefix={prefix} onBack={() => setPrefix(undefined)} />
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
              // TODO
            }}
          />
        )}
        {iconData.searchCollectionInfos(query).map(([prefix, info]) => (
          <IconCollectionCard
            key={prefix}
            prefix={prefix}
            info={info}
            onClick={() => setPrefix(prefix)}
          />
        ))}
      </div>
    </div>
  );
});

export const IconCollectionView: React.FC<{
  prefix: string;
  onBack: () => void;
}> = observer(({ prefix, onBack }) => {
  const [query, setQuery] = useState("");
  const [suffix, setSuffix] = useState("");
  const [collection, setCollection] = useState<IconCollection | undefined>();

  useEffect(() => {
    iconData.fetchCollection(prefix).then((collection) => {
      setCollection(collection);
      setSuffix(collection.suffixes[0]?.suffix ?? "");
    });
  }, []);

  const info = iconData.collectionInfos.get(prefix);
  if (!info) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex mx-4 my-3 mb-1 gap-1">
        <button onClick={onBack} className="-m-1 p-1">
          <Icon icon="material-symbols:chevron-left" className="text-base" />
        </button>
        <h1 className="font-semibold">{info.name}</h1>
        {!!collection?.suffixes.length && (
          <Select
            className="ml-auto"
            value={suffix}
            onChange={(e) => setSuffix(e.currentTarget.value)}
          >
            {collection.suffixes.map(({ suffix, name }) => (
              <option key={suffix} value={suffix}>
                {name}
              </option>
            ))}
          </Select>
        )}
      </div>
      <SearchInput
        placeholder="Search Icons"
        value={query}
        onChangeValue={setQuery}
      />
      <IconCollectionGrid
        prefix={prefix}
        names={collection?.searchIconNames(query, suffix) ?? []}
      />
    </div>
  );
});

const gridSize = 40;
const gridIconSize = 24;
const gridPadding = 8;

type IconCollectionGridElement = {
  x: number;
  y: number;
  name: string;
};

const IconCollectionGrid: React.FC<{
  prefix: string;
  names: string[];
}> = observer(({ prefix, names }) => {
  const ref = createRef<HTMLDivElement>();

  const [height, setHeight] = useState(0);
  const [elements, setElements] = useState<IconCollectionGridElement[]>([]);

  useEffect(() => {
    const elem = ref.current;
    if (!elem) {
      return;
    }

    const onResizeOrScroll = () => {
      const width = elem.clientWidth - gridPadding * 2;
      const cols = Math.floor(width / gridSize);
      const rows = Math.ceil(names.length / cols);
      const height = rows * gridSize;

      const scrollTop = elem.scrollTop - gridPadding;
      const topRow = Math.floor(scrollTop / gridSize);
      const bottomRow = Math.ceil((scrollTop + elem.clientHeight) / gridSize);

      const elements: IconCollectionGridElement[] = [];

      for (let row = topRow; row < bottomRow; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * gridSize;
          const y = row * gridSize;
          const i = row * cols + col;
          const name = names[i];
          if (name) {
            elements.push({ x: x + gridPadding, y: y + gridPadding, name });
          }
        }
      }

      iconData.fetchIcons(
        prefix,
        elements.map((e) => e.name)
      );

      setHeight(height + 2 * gridPadding);
      setElements(elements);
    };

    onResizeOrScroll();
    elem.addEventListener("scroll", onResizeOrScroll);
    window.addEventListener("resize", onResizeOrScroll);
    return () => {
      elem.removeEventListener("scroll", onResizeOrScroll);
      window.removeEventListener("resize", onResizeOrScroll);
    };
  }, [prefix, names]);

  return (
    <div
      ref={ref}
      className="flex-1 relative min-h-0 overflow-y-scroll text-base text-gray-700"
    >
      <div
        style={{
          width: "100%",
          height: height + "px",
        }}
      >
        {elements.map(({ x, y, name }) => {
          const icon = iconData.icons.get(prefix + ":" + name);
          if (icon) {
            return (
              <div
                className="absolute hover:bg-gray-100 rounded"
                style={{
                  left: x + "px",
                  top: y + "px",
                  width: gridSize + "px",
                  height: gridSize + "px",
                }}
              >
                <svg
                  className="absolute inset-0 m-auto"
                  key={name}
                  width={gridIconSize}
                  height={gridIconSize}
                  viewBox={`0 0 ${icon.width ?? 24} ${icon.width ?? 24}`}
                  dangerouslySetInnerHTML={{
                    __html: icon.body,
                  }}
                />
              </div>
            );
          }
        })}
      </div>
    </div>
  );
});
