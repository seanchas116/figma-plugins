import { Icon } from "@iconify/react";
import React, { useEffect, useMemo, useState } from "react";
import { IconCollection, iconData } from "../../state/IconData";
import { observer } from "mobx-react-lite";
import { Select } from "../../components/Input";
import { state } from "../../state/State";
import { action, makeObservable, observable } from "mobx";
import { IconCollectionGrid } from "./IconCollectionGrid";
import { SearchInput } from "./SearchInput";
import { debounce } from "lodash-es";
import { StarIcon } from "./StarIcon";

export const IconCollectionView: React.FC<{
  prefix: string;
  onBack: () => void;
}> = observer(({ prefix, onBack }) => {
  const suffix =
    state.iconSubset?.prefix === prefix ? state.iconSubset.suffix : "";
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState<IconCollection | undefined>();

  useEffect(() => {
    void iconData.fetchCollection(prefix).then((collection) => {
      setCollection(collection);
      const suffix = collection.suffixes[0]?.suffix ?? "";
      if (!state.iconSubset || state.iconSubset.prefix !== prefix) {
        state.iconSubset = {
          prefix,
          suffix,
        };
      }
    });
  }, []);

  const info = iconData.collectionInfos.get(prefix);
  if (!info) {
    return null;
  }

  const starred = state.starredIconPrefixes.has(prefix);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex mx-4 my-3 mb-1 gap-1 items-center group">
        <button onClick={onBack} className="-m-1 p-1">
          <Icon icon="material-symbols:chevron-left" className="text-base" />
        </button>
        <h1 className="font-semibold">{info.name}</h1>
        <a
          href={info.author.url}
          target="_blank"
          className="text-gray-400 hover:text-gray-500 mr-1"
        >
          <Icon icon="material-symbols:open-in-new" className="text-xs ml-1" />
        </a>
        <StarIcon
          value={starred}
          onChangeValue={action((value) => {
            if (value) {
              state.starredIconPrefixes.add(prefix);
            } else {
              state.starredIconPrefixes.delete(prefix);
            }
          })}
        />
        {!!collection?.suffixes.length && (
          <Select
            className="ml-auto"
            value={suffix}
            onChange={action((e) => {
              state.iconSubset = {
                prefix,
                suffix: e.currentTarget.value,
              };
            })}
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
        names={
          collection
            ?.searchIconNames(query, suffix)
            .map((name) => `${prefix}:${name}`) ?? []
        }
      />
    </div>
  );
});

class AllIconViewState {
  constructor() {
    makeObservable(this);
  }

  @observable _query = "";

  get query() {
    return this._query;
  }
  set query(value: string) {
    this._query = value;
    void this.search();
  }

  @observable.ref names: string[] = [];

  search = debounce(async () => {
    this.names = await iconData.searchAllIcon(this.query);
  }, 200);
}

export const AllIconView: React.FC<{
  onBack: () => void;
}> = observer(({ onBack }) => {
  const state = useMemo(() => new AllIconViewState(), []);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex mx-4 my-3 mb-1 gap-1 items-center">
        <button onClick={onBack} className="-m-1 p-1">
          <Icon icon="material-symbols:chevron-left" className="text-base" />
        </button>
        <h1 className="font-semibold">All</h1>
      </div>
      <SearchInput
        placeholder="Search Icons"
        value={state.query}
        onChangeValue={(value) => (state.query = value)}
      />
      <IconCollectionGrid names={state.names} />
    </div>
  );
});
