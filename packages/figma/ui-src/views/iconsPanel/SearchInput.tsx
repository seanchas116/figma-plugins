import { Icon } from "@iconify/react";
import React from "react";

export const SearchInput: React.FC<{
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
